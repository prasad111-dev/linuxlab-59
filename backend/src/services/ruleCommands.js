/**
 * Pure, dependency-free builder for the shell check command behind each
 * validation rule type. Kept separate from evaluationService so it can be
 * unit-tested without a DB or orchestrator.
 */

function shellQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function buildRuleCommand(rule) {
  const p = rule.params || {};
  const v = {
    file_exists: () => `test -f ${shellQuote(p.path)} && echo OK || echo FAIL`,
    dir_exists: () => `test -d ${shellQuote(p.path)} && echo OK || echo FAIL`,
    user_exists: () => `id -u ${shellQuote(p.username)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    user_absent: () => `! id -u ${shellQuote(p.username)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    group_exists: () => `getent group ${shellQuote(p.group)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    group_absent: () => `! getent group ${shellQuote(p.group)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    package_installed: () =>
      `dpkg -s ${shellQuote(p.package)} >/dev/null 2>&1 && echo OK || echo FAIL`,
    service_active: () => `systemctl is-active --quiet ${shellQuote(p.service)} && echo OK || echo FAIL`,
    service_enabled: () =>
      `systemctl is-enabled --quiet ${shellQuote(p.service)} 2>/dev/null && echo OK || echo FAIL`,
    port_open: () => `ss -ltn 2>/dev/null | grep -qE '[:.]${Number(p.port)}(\\s|$)' && echo OK || echo FAIL`,
    file_contains: () =>
      `grep -qF ${shellQuote(p.needle)} ${shellQuote(p.path)} 2>/dev/null && echo OK || echo FAIL`,
    file_permissions: () =>
      `[ "$(stat -c '%a' ${shellQuote(p.path)} 2>/dev/null)" = "${p.expected}" ] && echo OK || echo FAIL`,
    file_owner: () =>
      `[ "$(stat -c '%U:%G' ${shellQuote(p.path)} 2>/dev/null)" = "${p.expected}" ] && echo OK || echo FAIL`,
    file_type: () =>
      `[ "$(stat -c '%F' ${shellQuote(p.path)} 2>/dev/null)" = "${p.expected}" ] && echo OK || echo FAIL`,
    file_linkcount: () =>
      `[ "$(stat -c '%h' ${shellQuote(p.path)} 2>/dev/null)" = "${p.expected}" ] && echo OK || echo FAIL`,
    symlink_exists: () => `test -L ${shellQuote(p.path)} && echo OK || echo FAIL`,
    symlink_target: () =>
      `[ "$(readlink ${shellQuote(p.path)} 2>/dev/null)" = "${p.target}" ] && echo OK || echo FAIL`,
    hardlink_exists: () =>
      `[ ${shellQuote(p.a)} -ef ${shellQuote(p.b)} ] && echo OK || echo FAIL`,
    command_contains: () => `${p.command} 2>&1 | grep -qF ${shellQuote(p.needle)} && echo OK || echo FAIL`,
  };
  const builder = v[rule.type];
  if (!builder) return null;
  return builder();
}

module.exports = { shellQuote, buildRuleCommand };
