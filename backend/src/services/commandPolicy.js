/**
 * Task-based command policy.
 *
 * Derives an allow-list from a task's validation rules so students can only run
 * commands their task actually needs (e.g. package management for a package
 * task, useradd for a user task). Everything else is blocked. Read-only /
 * inspection commands are always allowed.
 */

const READ_ONLY = new Set([
  'ls', 'pwd', 'cd', 'cat', 'less', 'more', 'head', 'tail',
  'grep', 'egrep', 'fgrep', 'man', 'info', 'whatis', 'apropos', 'help',
  'clear', 'reset', 'history', 'fc', 'whoami', 'who', 'w', 'id', 'getent',
  'users', 'last', 'lastb', 'lastlog', 'loginctl', 'ac', 'lastcomm',
  'groups', 'stat', 'uname', 'hostname', 'uptime', 'which', 'type',
  'whereis', 'env', 'printenv', 'export', 'source', 'echo', 'printf',
  'date', 'sleep', 'true', 'false', 'exit', 'logout', 'df', 'du', 'free',
  'top', 'ps', 'pgrep', 'pidof', 'wc', 'sort', 'uniq', 'cut', 'tr', 'awk',
  'xargs', 'nl', 'od', 'hexdump', 'file', 'readlink', 'realpath',
  'basename', 'dirname', 'seq', 'test', 'time', 'tty', 'stty', 'yes',
  'sha256sum', 'sha1sum', 'md5sum', 'cksum', 'find', 'namei', 'tree',
  'curl', 'wget', 'ss', 'netstat', 'lsof', 'ip', 'route', 'arp', 'ping',
  'ifconfig', 'traceroute', 'dig', 'nslookup', 'host', 'getent',
  'dnsdomainname', 'nmap',
]);

const PIPE_FILTERS = new Set([
  'grep', 'egrep', 'fgrep', 'head', 'tail', 'less', 'more', 'wc',
  'sort', 'uniq', 'cut', 'tr', 'awk', 'xargs', 'nl', 'od', 'hexdump',
  'sed', 'iconv', 'column',
]);

const PACKAGE_WORDS = new Set([
  'apt', 'apt-get', 'aptitude', 'dpkg', 'snap', 'apt-cache', 'apt-mark', 'add-apt-repository',
]);

const USER_WORDS = new Set([
  'useradd', 'adduser', 'usermod', 'userdel', 'passwd', 'chpasswd', 'chsh', 'chfn', 'login', 'su',
  'chage', 'pkill', 'kill', 'killall',
]);

const GROUP_WORDS = new Set([
  'groupadd', 'addgroup', 'gpasswd', 'groupdel', 'groupmems',
]);

const FILE_WORDS = new Set([
  'mkdir', 'touch', 'chmod', 'chown', 'chgrp', 'ln', 'rm', 'cp', 'mv',
  'nano', 'vi', 'vim', 'tee', 'sed', 'install', 'truncate', 'tar',
]);

// These file commands create or place content, so they may also target a
// parent directory of a task path (e.g. `mkdir -p /var/www/acme` when the
// task file is /var/www/acme/index.html). Destructive ones (rm, sed -i,
// tar, truncate) stay exact-path-only.
const SAFE_FILE_WORDS = new Set([
  'mkdir', 'touch', 'chmod', 'chown', 'chgrp', 'ln', 'cp', 'mv',
  'nano', 'vi', 'vim', 'tee', 'install',
]);

// Destructive commands only ever target an exact task path or a nested path
// (no loose basename matching, no parent-dir allowance).
const DESTRUCTIVE_FILE_WORDS = new Set(['rm', 'truncate', 'tar', 'sed']);

const CRON_WORDS = new Set(['crontab']);

const SERVICE_WORDS = new Set(['systemctl', 'service', 'systemd-run', 'initctl']);

const PORT_WORDS = new Set(['ufw', 'iptables', 'ip6tables', 'firewall-cmd']);

const SERVICE_INSPECT = new Set(['status', 'is-active', 'is-enabled', 'is-failed', 'is-system-running', 'show', 'cat']);

function cleanTerminalLine(raw) {
  return String(raw)
    .replace(/\x1b\]\d+;.*?(\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replace(/\x1b[()][0-9A-B]/g, '')
    .replace(/\x1b[=>]/g, '')
    .replace(/\x00/g, '');
}

function applyBackspaces(line) {
  const chars = [];
  for (const ch of line) {
    if (ch === '\b' || ch === '\x7f') chars.pop();
    else if (ch === '\x00') continue;
    else chars.push(ch);
  }
  return chars.join('');
}

function firstWord(segment) {
  return (segment.match(/^[^\s;|&()]+/) || [''])[0].trim();
}

function stripPrefix(segment) {
  let s = segment.trim().replace(/^\(\s*/, '').replace(/\s*\)$/, '');
  s = s.replace(/(^|\s)sudo(\s|$)/g, ' ');
  s = s.replace(/^env\s+[A-Z_]+=[^\s]+(\s|$)/, '');
  return s.trim();
}

function splitSegments(line) {
  return String(line).split(/\s*(?:&&|\|\||;)\s*/);
}

function splitPipeline(segment) {
  return String(segment)
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

function targetPath(segment, paths) {
  for (const p of paths) {
    if (segment.includes(p)) return true;
    const base = p.split('/').filter(Boolean).pop();
    if (base && new RegExp(`(^|\\s|/|['\"])${base}(\\s|$|['\"])`).test(segment)) return true;
  }
  return false;
}

/** Exact-path / nested-path match only (no loose basename matching). */
function targetPathSubpath(segment, paths) {
  for (const p of paths) {
    if (segment.includes(p)) return true;
  }
  return false;
}

function targetName(segment, names) {
  const seg = ` ${segment.replace(/[=:]/g, ' ')} `;
  for (const n of names) {
    if (seg.includes(` ${n} `) || seg.includes(`'${n}'`) || seg.includes(`"${n}"`)) return true;
  }
  return false;
}

/** True when a token in the segment is a parent directory of a policy path. */
function targetIsParentDir(segment, paths) {
  for (const token of String(segment).split(/\s+/)) {
    const t = token.replace(/^['"]/, '').replace(/['"]$/, '');
    if (!t || t.startsWith('-') || /[^A-Za-z0-9._~/@+-]/.test(t)) continue;
    for (const p of paths) {
      if (String(p).startsWith(`${t}/`)) return true;
    }
  }
  return false;
}

/**
 * Is a path token covered by the task's allowed paths? Accepts the exact
 * path, a path nested under an allowed directory, or a bare basename.
 */
function isPathInSet(token, paths) {
  const t = String(token).trim().replace(/^['"]/, '').replace(/['"]$/, '');
  if (!t) return false;
  for (const p of paths) {
    if (!p) continue;
    if (t === p) return true;
    if (t.startsWith(`${p}/`)) return true;
    const base = p.split('/').filter(Boolean).pop();
    if (base && (t === base || t.endsWith(`/${base}`) || t.startsWith(`${base}/`))) return true;
  }
  return false;
}

/** Replace quoted spans with spaces so redirect detection ignores quoted text. */
function stripQuoted(line) {
  let out = '';
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === "'") {
      const end = line.indexOf("'", i + 1);
      if (end === -1) return out + line.slice(i);
      out += ' '.repeat(end - i + 1);
      i = end + 1;
    } else if (c === '"') {
      let j = i + 1;
      while (j < line.length && (line[j] !== '"' || line[j - 1] === '\\')) j += 1;
      const end = j < line.length ? j : line.length - 1;
      out += ' '.repeat(end - i + 1);
      i = end + 1;
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

/** Extract the target of every output redirection (>, >>, &>, n>) on a segment. */
function outputRedirectTargets(segment) {
  const targets = [];
  const re = /(?:^|\s)(\d*&?>>?)(?:\s*)([^\s;&|()<>]+)/g;
  let m;
  while ((m = re.exec(stripQuoted(segment)))) targets.push(m[2]);
  return targets;
}

/** A redirect target is safe when it is an fd dup (/dev/null etc.) or an allowed task path. */
function isSafeRedirectTarget(target, paths) {
  const t = String(target).trim().replace(/^['"]/, '').replace(/['"]$/, '');
  if (!t) return true;
  if (/^\d+$/.test(t)) return true; // fd-style target (e.g. 2>, &1)
  if (t.startsWith('&')) return true; // 2>&1 style dup
  if (/^\/dev\/(null|zero|tty|stdin|stdout|stderr)(\/.*)?$/.test(t)) return true;
  return isPathInSet(t, paths);
}

/**
 * Build a policy object from a task document.
 */
function buildPolicy(task) {
  const rules = (task && task.validationRules) || [];
  const users = new Set();
  const groups = new Set();
  const paths = new Set();
  const services = new Set();
  let packages = false;
  let ports = false;
  let cron = false;

  for (const r of rules) {
    const p = r.params || {};
    switch (r.type) {
      case 'user_exists':
      case 'user_absent':
        if (p.username) users.add(String(p.username));
        break;
      case 'group_exists':
      case 'group_absent':
        if (p.group) groups.add(String(p.group));
        break;
      case 'package_installed':
        packages = true;
        break;
      case 'command_contains':
        if (String(p.command || '').includes('crontab')) cron = true;
        break;
      case 'service_active':
      case 'service_enabled':
        if (p.service) services.add(String(p.service));
        break;
      case 'file_exists':
      case 'dir_exists':
      case 'file_contains':
      case 'file_permissions':
      case 'file_owner':
      case 'file_type':
      case 'file_linkcount':
      case 'symlink_exists':
        if (p.path) paths.add(String(p.path));
        break;
      case 'symlink_target':
        if (p.path) paths.add(String(p.path));
        if (p.target) paths.add(String(p.target));
        break;
      case 'hardlink_exists':
        if (p.a) paths.add(String(p.a));
        if (p.b) paths.add(String(p.b));
        break;
      case 'port_open':
        ports = true;
        break;
      default:
        break;
    }
  }

  // User/group tasks legitimately need to check or edit credential files.
  if (users.size > 0 || groups.size > 0) {
    for (const f of ['/etc/passwd', '/etc/shadow', '/etc/group', '/etc/gshadow', '/etc/sudoers']) {
      paths.add(f);
    }
  }

  // User tasks manage each user's home directory (create, chmod, chown, ssh).
  if (users.size > 0) {
    for (const u of users) paths.add(`/home/${u}`);
  }

  const hints = [];
  if (packages) hints.push('package management (apt/apt-get/dpkg)');
  if (users.size > 0) {
    hints.push(`user commands for: ${[...users].join(', ')}`);
    hints.push('check credentials with: cat /etc/passwd, getent passwd <user>, passwd <user>');
  }
  if (groups.size > 0) hints.push(`group commands for: ${[...groups].join(', ')}`);
  if (services.size > 0) hints.push(`service commands for: ${[...services].join(', ')}`);
  if (paths.size > 0) hints.push('file commands (only for the files in this task)');
  if (ports) hints.push('firewall (ufw/iptables)');
  if (cron) hints.push('cron scheduling (crontab)');

  return {
    allowAll: rules.length === 0,
    users,
    groups,
    paths,
    services,
    packages,
    ports,
    cron,
    hint: hints.join('; ') || 'read-only commands',
  };
}

function isAllowedAction(segment, policy, hadSudo = false) {
  if (policy.allowAll) return true;

  // User-management tasks may verify privileges with `sudo -i` / `sudo -s` /
  // `sudo -l`, or `sudo -l -U <user>` / `sudo -u <user>` when the target is one
  // of the task's users. These forms make no sense without a managed user.
  if (hadSudo && policy.users.size > 0) {
    const t = segment.trim();
    if (t === '-i' || t === '-s' || t === '-l') return true;
    const m = t.match(/^-(?:l\s+-U|u)\s+(\S+)/);
    if (m && policy.users.has(String(m[1]).replace(/^['"]|['"]$/g, ''))) return true;
  }

  const word = firstWord(segment);

  // find is read-only for inspection, but its destructive flags are not
  if (word === 'find') {
    if (/-(?:delete|exec|execdir|ok|okdir)\b/.test(segment)) return false;
    return true;
  }

  if (READ_ONLY.has(word)) return true;

  if (PACKAGE_WORDS.has(word)) return policy.packages;
  if (USER_WORDS.has(word)) {
    if (policy.users.size === 0) return false;
    // passwd/chpasswd may run interactively (bare) to set/check the account password
    if (word === 'passwd' || word === 'chpasswd' || word === 'login') return true;
    return targetName(segment, policy.users);
  }
  if (word === 'visudo') return policy.users.size > 0 || policy.groups.size > 0;
  if (GROUP_WORDS.has(word)) return policy.groups.size > 0 && targetName(segment, policy.groups);
  if (PORT_WORDS.has(word)) return policy.ports;
  if (CRON_WORDS.has(word)) return policy.cron;

  if (SERVICE_WORDS.has(word)) {
    const arg = firstWord(segment.replace(word, '').trim()) || '';
    if (SERVICE_INSPECT.has(arg)) return true;
    return policy.services.size > 0 && targetName(segment, policy.services);
  }

  if (FILE_WORDS.has(word)) {
    if (policy.paths.size === 0) return false;
    if (DESTRUCTIVE_FILE_WORDS.has(word)) return targetPathSubpath(segment, policy.paths);
    if (targetPath(segment, policy.paths)) return true;
    if (SAFE_FILE_WORDS.has(word) && targetIsParentDir(segment, policy.paths)) return true;
    return false;
  }

  // Daemon config tests (`nginx -t`, `sshd -t`) are safe verification steps
  // for the service tasks; the daemons themselves are service-gated.
  if (word === 'nginx' || word === 'sshd') {
    if (/(^|\s)-[tT](\s|$)/.test(segment)) return true;
    return policy.services.size > 0 && targetName(segment, policy.services);
  }

  return false;
}
/**
 * Validate a typed command line against the policy.
 * Returns { allowed: boolean, command: string, hint: string }.
 */
function checkCommand(line, policy) {
  if (!line || !String(line).trim()) return { allowed: true };
  const cleaned = cleanTerminalLine(line);
  const text = applyBackspaces(cleaned).trim();
  if (!text) return { allowed: true };
  if (text.startsWith('#')) return { allowed: true }; // shell comment / no-op

  const segments = splitSegments(text);
  for (const rawSeg of segments) {
    const hadSudo = /^\s*sudo(\s|$)/.test(rawSeg);
    const seg = stripPrefix(rawSeg);
    if (!seg) continue;

    const pipeline = splitPipeline(seg);
    const main = pipeline[0];
    if (!main) continue;
    if (!isAllowedAction(main, policy, hadSudo)) {
      return { allowed: false, command: firstWord(main), hint: policy.hint };
    }
    for (let i = 1; i < pipeline.length; i++) {
      const w = firstWord(stripPrefix(pipeline[i]));
      if (w && !PIPE_FILTERS.has(w) && !(CRON_WORDS.has(w) && policy.cron)) {
        return { allowed: false, command: w, hint: policy.hint };
      }
    }
    // Output redirection to a file is only allowed for this task's paths
    for (const target of outputRedirectTargets(seg)) {
      if (!isSafeRedirectTarget(target, policy.paths)) {
        return { allowed: false, command: `> ${target}`, hint: `writing to "${target}" is not allowed for this task` };
      }
    }
  }
  return { allowed: true };
}

function blockMessage(res) {
  return `Blocked by task policy: "${res.command}" is not allowed. This task allows: ${res.hint}.`;
}

/** Reduce a raw terminal line (with escape/control bytes) to its visible text. */
function cleanLineForDisplay(raw) {
  return applyBackspaces(cleanTerminalLine(raw));
}

module.exports = { buildPolicy, checkCommand, blockMessage, cleanLineForDisplay };
