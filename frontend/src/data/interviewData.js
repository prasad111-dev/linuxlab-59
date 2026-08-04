// ---------------------------------------------------------------------------
// Interview Preparation data
// Flashcard Duel: 25 tiers x 5 commands = 125 flashcards (auto-generated MCQs)
// Quest Mode: 30 real-world scenarios -> answer command
// Typing Shooter: 30 commands to type
// ---------------------------------------------------------------------------

export const FLASHCARD_TIERS = [
  {
    id: 1,
    name: 'Navigation Basics',
    commands: [
      { cmd: 'ls', desc: 'List directory contents' },
      { cmd: 'cd', desc: 'Change the current working directory' },
      { cmd: 'pwd', desc: 'Print the current working directory path' },
      { cmd: 'clear', desc: 'Clear the terminal screen' },
      { cmd: 'tree', desc: 'Display directories as a tree of files and folders' },
    ],
  },
  {
    id: 2,
    name: 'Getting Help',
    commands: [
      { cmd: 'man', desc: 'Display the manual (docs) page for a command' },
      { cmd: 'whatis', desc: 'Show a one-line summary of what a command does' },
      { cmd: 'apropos', desc: 'Search the manual pages for keywords' },
      { cmd: 'help', desc: 'Show help for a bash built-in command' },
      { cmd: 'info', desc: 'Display detailed GNU info documentation' },
    ],
  },
  {
    id: 3,
    name: 'File & Directory Operations',
    commands: [
      { cmd: 'touch', desc: 'Create an empty file or update its timestamp' },
      { cmd: 'mkdir', desc: 'Create a new directory' },
      { cmd: 'cp', desc: 'Copy files or directories' },
      { cmd: 'mv', desc: 'Move or rename files and directories' },
      { cmd: 'rm', desc: 'Remove (delete) files or directories' },
    ],
  },
  {
    id: 4,
    name: 'Viewing Files',
    commands: [
      { cmd: 'cat', desc: 'Print the whole contents of a file to the screen' },
      { cmd: 'less', desc: 'View a file page by page with scroll and search' },
      { cmd: 'head', desc: 'Print the first lines of a file' },
      { cmd: 'tail', desc: 'Print the last lines of a file' },
      { cmd: 'nl', desc: 'Print a file with line numbers added' },
    ],
  },
  {
    id: 5,
    name: 'Searching & Filtering',
    commands: [
      { cmd: 'grep', desc: 'Search lines in files matching a pattern' },
      { cmd: 'find', desc: 'Search the filesystem for files matching criteria' },
      { cmd: 'locate', desc: 'Quickly find files using a prebuilt database' },
      { cmd: 'which', desc: 'Show the path of an executable command' },
      { cmd: 'whereis', desc: 'Find the binary, source and man page of a command' },
    ],
  },
  {
    id: 6,
    name: 'Text Processing',
    commands: [
      { cmd: 'sed', desc: 'Stream editor to filter and transform text' },
      { cmd: 'awk', desc: 'Pattern scanning and text-processing language' },
      { cmd: 'sort', desc: 'Sort lines of text' },
      { cmd: 'uniq', desc: 'Report or omit repeated lines (usually after sort)' },
      { cmd: 'cut', desc: 'Extract selected columns/fields from lines' },
    ],
  },
  {
    id: 7,
    name: 'Permissions & Ownership',
    commands: [
      { cmd: 'chmod', desc: 'Change file permissions (read/write/execute)' },
      { cmd: 'chown', desc: 'Change file owner and group' },
      { cmd: 'chgrp', desc: 'Change the group of a file or directory' },
      { cmd: 'umask', desc: 'Set the default permission mask for new files' },
      { cmd: 'su', desc: 'Switch user / run a shell as another user' },
    ],
  },
  {
    id: 8,
    name: 'Process Management',
    commands: [
      { cmd: 'ps', desc: 'Snapshot of currently running processes' },
      { cmd: 'top', desc: 'Live view of processes sorted by CPU/memory' },
      { cmd: 'kill', desc: 'Send a signal (by default terminate) to a process' },
      { cmd: 'killall', desc: 'Kill processes by name' },
      { cmd: 'jobs', desc: 'List background jobs of the current shell' },
    ],
  },
  {
    id: 9,
    name: 'System Info',
    commands: [
      { cmd: 'uname', desc: 'Print kernel and system information' },
      { cmd: 'whoami', desc: 'Print the current user name' },
      { cmd: 'hostname', desc: 'Show or set the system hostname' },
      { cmd: 'uptime', desc: 'Show how long the system has been running' },
      { cmd: 'free', desc: 'Show memory and swap usage' },
    ],
  },
  {
    id: 10,
    name: 'Disk & Filesystem',
    commands: [
      { cmd: 'df', desc: 'Show disk space usage of filesystems' },
      { cmd: 'du', desc: 'Show disk usage of files and directories' },
      { cmd: 'mount', desc: 'Attach a filesystem to the directory tree' },
      { cmd: 'lsblk', desc: 'List block devices (disks and partitions)' },
      { cmd: 'fdisk', desc: 'Partition manipulation tool' },
    ],
  },
  {
    id: 11,
    name: 'Compression & Archives',
    commands: [
      { cmd: 'tar', desc: 'Bundle files into an archive (with or without compression)' },
      { cmd: 'gzip', desc: 'Compress files with .gz format' },
      { cmd: 'gunzip', desc: 'Decompress .gz files' },
      { cmd: 'zip', desc: 'Create compressed .zip archives' },
      { cmd: 'unzip', desc: 'Extract .zip archives' },
    ],
  },
  {
    id: 12,
    name: 'Networking',
    commands: [
      { cmd: 'ping', desc: 'Test reachability/latency of a host over ICMP' },
      { cmd: 'curl', desc: 'Transfer data to/from a URL (HTTP etc.)' },
      { cmd: 'wget', desc: 'Download files from the web' },
      { cmd: 'netstat', desc: 'Show network connections, routing and interfaces' },
      { cmd: 'ss', desc: 'Socket statistics — modern replacement for netstat' },
    ],
  },
  {
    id: 13,
    name: 'DNS & Hosts',
    commands: [
      { cmd: 'nslookup', desc: 'Query DNS records for a hostname' },
      { cmd: 'dig', desc: 'Flexible DNS lookup tool' },
      { cmd: 'host', desc: 'Simple DNS lookup utility' },
      { cmd: 'getent', desc: 'Look up entries in system databases (passwd, hosts…)' },
      { cmd: 'ifconfig', desc: 'Configure or inspect network interfaces' },
    ],
  },
  {
    id: 14,
    name: 'Package Management',
    commands: [
      { cmd: 'apt', desc: 'Debian/Ubuntu package manager (install, update, upgrade)' },
      { cmd: 'dpkg', desc: 'Low-level Debian package manager' },
      { cmd: 'yum', desc: 'RHEL/CentOS package manager' },
      { cmd: 'rpm', desc: 'Red Hat package manager for .rpm files' },
      { cmd: 'snap', desc: 'Canonical snap package management' },
    ],
  },
  {
    id: 15,
    name: 'User Management',
    commands: [
      { cmd: 'useradd', desc: 'Create a new user account' },
      { cmd: 'usermod', desc: 'Modify an existing user account' },
      { cmd: 'userdel', desc: 'Delete a user account' },
      { cmd: 'passwd', desc: 'Set or change a user password' },
      { cmd: 'groups', desc: 'List the groups a user belongs to' },
    ],
  },
  {
    id: 16,
    name: 'Group Management',
    commands: [
      { cmd: 'groupadd', desc: 'Create a new group' },
      { cmd: 'groupmod', desc: 'Modify an existing group' },
      { cmd: 'groupdel', desc: 'Delete a group' },
      { cmd: 'newgrp', desc: 'Log into a new group in a fresh shell' },
      { cmd: 'id', desc: 'Print user and group IDs and memberships' },
    ],
  },
  {
    id: 17,
    name: 'File Linking',
    commands: [
      { cmd: 'ln', desc: 'Create hard or symbolic links between files' },
      { cmd: 'readlink', desc: 'Resolve and print the target of a symlink' },
      { cmd: 'realpath', desc: 'Print the canonical absolute path of a file' },
      { cmd: 'stat', desc: 'Display detailed file or filesystem metadata' },
      { cmd: 'file', desc: 'Detect and print the type of a file' },
    ],
  },
  {
    id: 18,
    name: 'Environment Variables',
    commands: [
      { cmd: 'export', desc: 'Set an environment variable for child processes' },
      { cmd: 'printenv', desc: 'Print all or a specific environment variable' },
      { cmd: 'env', desc: 'Run a command with a modified environment' },
      { cmd: 'unset', desc: 'Remove a variable or function from the shell' },
      { cmd: 'source', desc: 'Execute a script in the current shell (e.g. ~/.bashrc)' },
    ],
  },
  {
    id: 19,
    name: 'Job Control & Scheduling',
    commands: [
      { cmd: 'cron', desc: 'Daemon that runs scheduled jobs on a schedule' },
      { cmd: 'crontab', desc: 'Manage per-user cron schedules' },
      { cmd: 'at', desc: 'Run a command once at a specific time' },
      { cmd: 'sleep', desc: 'Pause execution for a given duration' },
      { cmd: 'watch', desc: 'Re-run a command periodically and show output' },
    ],
  },
  {
    id: 20,
    name: 'Bash Basics',
    commands: [
      { cmd: 'echo', desc: 'Print text to the standard output' },
      { cmd: 'printf', desc: 'Print formatted text' },
      { cmd: 'read', desc: 'Read a line of input into a variable' },
      { cmd: 'alias', desc: 'Create a shortcut name for a command' },
      { cmd: 'set', desc: 'Set or unset shell options and variables' },
    ],
  },
  {
    id: 21,
    name: 'Shell Scripting',
    commands: [
      { cmd: 'if', desc: 'Conditional execution in shell scripts' },
      { cmd: 'for', desc: 'Loop over a list of items in shell scripts' },
      { cmd: 'while', desc: 'Loop while a condition is true' },
      { cmd: 'case', desc: 'Pattern-matched branching in shell scripts' },
      { cmd: 'function', desc: 'Define a reusable function in bash' },
    ],
  },
  {
    id: 22,
    name: 'Input/Output Redirection',
    commands: [
      { cmd: '>', desc: 'Redirect stdout to a file (overwrite)' },
      { cmd: '>>', desc: 'Redirect stdout to a file (append)' },
      { cmd: '<', desc: 'Redirect a file into stdin' },
      { cmd: '|', desc: 'Pipe stdout of one command into the next' },
      { cmd: 'tee', desc: 'Write output to both the screen and a file' },
    ],
  },
  {
    id: 23,
    name: 'Process Signals & Jobs',
    commands: [
      { cmd: 'kill', desc: 'Send a signal to a process by PID' },
      { cmd: 'killall', desc: 'Send a signal to processes matching a name' },
      { cmd: 'nohup', desc: 'Run a command immune to hangups (logout)' },
      { cmd: 'disown', desc: 'Remove a job from the shell job table' },
      { cmd: 'bg', desc: 'Resume a suspended job in the background' },
    ],
  },
  {
    id: 24,
    name: 'Security & Firewall',
    commands: [
      { cmd: 'iptables', desc: 'Configure Linux netfilter firewall rules' },
      { cmd: 'ufw', desc: 'Uncomplicated Firewall — simple iptables frontend' },
      { cmd: 'fail2ban', desc: 'Ban IPs that show malicious behavior' },
      { cmd: 'sshd', desc: 'The OpenSSH daemon server' },
      { cmd: 'ssh', desc: 'Secure shell client for remote login' },
    ],
  },
  {
    id: 25,
    name: 'System & Hardware',
    commands: [
      { cmd: 'systemctl', desc: 'Control systemd services and the system' },
      { cmd: 'journalctl', desc: 'Query the systemd journal (logs)' },
      { cmd: 'timedatectl', desc: 'Show or set system time, date and timezone' },
      { cmd: 'lscpu', desc: 'Display CPU architecture information' },
      { cmd: 'lsusb', desc: 'List USB devices connected to the system' },
    ],
  },
];

// Auto-build 125 flashcards: question + answer, options = answer + 3 distractors
export const FLASHCARDS = (() => {
  const pool = FLASHCARD_TIERS.flatMap((t) =>
    t.commands.map((c) => ({ cmd: c.cmd, desc: c.desc, tier: t.name }))
  );
  return pool.map((c, i) => {
    const distractors = pool
      .filter((_, j) => j !== i)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((d) => d.desc);
    const options = shuffle([c.desc, ...distractors]);
    return {
      id: i + 1,
      cmd: c.cmd,
      tier: c.tier,
      question: `What does \`${c.cmd}\` do?`,
      answer: c.desc,
      options,
      explanation: `\`${c.cmd}\` — ${c.desc}.`,
    };
  });
})();

export const QUESTS = [
  { id: 1, prompt: 'Where am I right now in the filesystem?', answer: 'pwd' },
  { id: 2, prompt: 'What files and folders are in this directory (including hidden ones)?', answer: 'ls -la' },
  { id: 3, prompt: 'Set up a new project folder called "projects".', answer: 'mkdir projects' },
  { id: 4, prompt: 'Create a nested folder chain app/views in one go.', answer: 'mkdir -p app/views' },
  { id: 5, prompt: 'Create an empty file named index.html.', answer: 'touch index.html' },
  { id: 6, prompt: 'Delete the file temp.txt.', answer: 'rm temp.txt' },
  { id: 7, prompt: 'Delete the folder old-build and everything inside it.', answer: 'rm -rf old-build' },
  { id: 8, prompt: 'Rename draft.txt to final.txt.', answer: 'mv draft.txt final.txt' },
  { id: 9, prompt: 'Make a backup copy of config.json called config.backup.', answer: 'cp config.json config.backup' },
  { id: 10, prompt: 'Copy the entire src folder to dist.', answer: 'cp -r src dist' },
  { id: 11, prompt: 'What type of file is script.sh?', answer: 'file script.sh' },
  { id: 12, prompt: 'How much disk space does the /var/log folder take?', answer: 'du -sh /var/log' },
  { id: 13, prompt: 'Print the whole contents of config.txt to the screen.', answer: 'cat config.txt' },
  { id: 14, prompt: 'Show only the first 10 lines of server.log.', answer: 'head -10 server.log' },
  { id: 15, prompt: 'Show only the last 20 lines of error.log.', answer: 'tail -20 error.log' },
  { id: 16, prompt: 'Watch app.log live as new lines are appended.', answer: 'tail -f app.log' },
  { id: 17, prompt: 'Count how many lines are in server.log.', answer: 'wc -l server.log' },
  { id: 18, prompt: 'Find every occurrence of "error" inside /var/log.', answer: 'grep -r "error" /var/log' },
  { id: 19, prompt: 'Count how many lines contain "warning" in app.log.', answer: 'grep -c "warning" app.log' },
  { id: 20, prompt: 'Count unique IP addresses in access.log (first column).', answer: "cut -d' ' -f1 access.log | sort | uniq | wc -l" },
  { id: 21, prompt: 'Sort the lines of data.txt alphabetically.', answer: 'sort data.txt' },
  { id: 22, prompt: 'Remove duplicate consecutive lines from data.txt.', answer: 'uniq data.txt' },
  { id: 23, prompt: 'Find any file named like "config*.yaml" starting from here.', answer: 'find . -name "config*.yaml"' },
  { id: 24, prompt: 'Search for "api_key" in every file under src/.', answer: 'grep -r "api_key" src/' },
  { id: 25, prompt: 'Compress the /home folder into backup.tar.gz.', answer: 'tar -czf backup.tar.gz /home' },
  { id: 26, prompt: 'Extract backup.tar.gz.', answer: 'tar -xzf backup.tar.gz' },
  { id: 27, prompt: 'List every running process with full details.', answer: 'ps aux' },
  { id: 28, prompt: 'Forcefully terminate process 1234.', answer: 'kill -9 1234' },
  { id: 29, prompt: 'Make script.sh executable.', answer: 'chmod +x script.sh' },
  { id: 30, prompt: 'Show free disk space on all mounted filesystems.', answer: 'df -h' },
];

export const TYPING_COMMANDS = [
  'ls -la',
  'rm -rf',
  'chmod +x',
  'grep -r',
  'find . -name',
  'ps aux',
  'kill -9',
  'df -h',
  'tar -xzf',
  'ip addr show',
  'cat /etc/passwd',
  'ssh user@host',
  'sudo apt update',
  'tail -f /var/log/syslog',
  'systemctl restart nginx',
  'mkdir -p a/b/c',
  'mv file.txt new.txt',
  'du -sh /var',
  'whoami && date',
  'git status',
  'curl -I https://example.com',
  'tar -czf bundle.tar.gz src',
  "awk '{print $1}' data.txt",
  "sed -i 's/old/new/g' file.txt",
  'chown user:group file.txt',
  'watch -n 2 uptime',
  'nohup npm start &',
  'crontab -l',
  'history | grep ssh',
  'ls -l /etc | grep -i conf',
];

export const MODES = [
  {
    mode: 'flashcard',
    title: 'Flashcard Duel',
    tagline: '125 multiple-choice flashcards across 25 topic tiers',
    icon: '🧠',
    gradient: 'from-purple-500 to-fuchsia-600',
    route: '/interview/flashcard',
  },
  {
    mode: 'quest',
    title: 'Quest Mode',
    tagline: '30 real-world scenarios — type the exact command',
    icon: '🗺️',
    gradient: 'from-emerald-500 to-brand-600',
    route: '/interview/quest',
  },
  {
    mode: 'typing',
    title: 'Typing Shooter',
    tagline: '30 commands — type them fast and accurately',
    icon: '⌨️',
    gradient: 'from-brand-500 to-amber-600',
    route: '/interview/typing',
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
