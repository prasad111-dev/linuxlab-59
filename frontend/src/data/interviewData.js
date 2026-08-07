// ---------------------------------------------------------------------------
// Interview Preparation data
// Flashcard Duel: 28 tiers x 5 commands = 140 flashcards (auto-generated MCQs)
// Quest Mode: 46 real-world scenarios -> answer command
// Typing Shooter: 46 commands to type
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
  {
    id: 26,
    name: 'Archives & Compression',
    commands: [
      { cmd: 'tar', desc: 'Create or extract archive files (add -z/-j/-J to compress)' },
      { cmd: 'gzip', desc: 'Compress a file and append .gz (gzip -d to decompress)' },
      { cmd: 'bzip2', desc: 'Compress a file into .bz2, better ratio than gzip' },
      { cmd: 'xz', desc: 'Compress a file into .xz, best ratio of the common tools' },
      { cmd: 'unxz', desc: 'Decompress a .xz file back to its original form' },
    ],
  },
  {
    id: 27,
    name: 'Network Tools & Config',
    commands: [
      { cmd: 'ip', desc: 'Show or configure network interfaces, addresses and routes' },
      { cmd: 'traceroute', desc: 'Trace the route packets take to a remote host' },
      { cmd: 'nmcli', desc: 'Manage network connections through NetworkManager' },
      { cmd: 'netplan', desc: 'Declare network interfaces with netplan YAML config files' },
      { cmd: 'firewall-cmd', desc: 'Manage firewalld zones and rules (RHEL/CentOS)' },
    ],
  },
  {
    id: 28,
    name: 'Packet Capture & Advanced Firewalls',
    commands: [
      { cmd: 'tcpdump', desc: 'Capture and display packets on a network interface' },
      { cmd: 'tshark', desc: 'Dump and analyze packets (the Wireshark command-line tool)' },
      { cmd: 'nft', desc: 'Configure the modern nftables firewall' },
      { cmd: 'nmap', desc: 'Scan hosts and ports to discover open services' },
      { cmd: 'mtr', desc: 'Combine ping and traceroute for continuous diagnostics' },
    ],
  },
];

// Auto-build 140 flashcards: question + answer, options = answer + 3 distractors
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
  { id: 31, prompt: 'Create a gzip-compressed tar archive of the folder named "app" called backup.tar.gz.', answer: 'tar -czf backup.tar.gz app' },
  { id: 32, prompt: 'Create a bzip2-compressed tar archive of "app" called backup.tar.bz2.', answer: 'tar -cjf backup.tar.bz2 app' },
  { id: 33, prompt: 'List the contents of backup.tar.gz WITHOUT extracting it.', answer: 'tar -tzf backup.tar.gz' },
  { id: 34, prompt: 'Extract backup.tar.bz2 into the current directory.', answer: 'tar -xjf backup.tar.bz2' },
  { id: 35, prompt: 'Show every IP address assigned to every interface.', answer: 'ip addr show' },
  { id: 36, prompt: 'Show the default routing table and default gateway.', answer: 'ip route show' },
  { id: 37, prompt: 'Test whether host example.com is reachable, sending 3 packets.', answer: 'ping -c 3 example.com' },
  { id: 38, prompt: 'Trace the network path packets take to example.com.', answer: 'traceroute example.com' },
  { id: 39, prompt: 'Look up the DNS A record for example.com.', answer: 'dig example.com A' },
  { id: 40, prompt: 'Look up the DNS records using the system resolver.', answer: 'nslookup example.com' },
  { id: 41, prompt: 'List all listening TCP sockets with the owning processes.', answer: 'ss -ltnp' },
  { id: 42, prompt: 'Check which process owns the process for port 8080.', answer: 'lsof -i :8080' },
  { id: 43, prompt: 'Display the machine ARP cache mapping IPs to MAC addresses.', answer: 'ip neigh show' },
  { id: 44, prompt: 'Allow TCP port 443/tcp through the default Ubuntu firewall.', answer: 'ufw allow 443/tcp' },
  { id: 45, prompt: 'Enable the firewall service and refuse new incoming connections (keep current rules).', answer: 'ufw enable' },
  { id: 46, prompt: 'Capture 20 packets on interface eth0 and save them to cap.pcap.', answer: 'tcpdump -i eth0 -c 20 -w cap.pcap' },
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
  'tar -tzf backup.tar.gz',
  'tar -cjf backup.tar.bz2 src',
  'gzip -d app.log.gz',
  'xz -d archive.tar.xz',
  'ip route show',
  'ss -ltnp',
  'dig example.com A',
  'nslookup example.com',
  'traceroute example.com',
  'ping -c 3 example.com',
  'lsof -i :8080',
  'ip neigh show',
  'ufw allow 443/tcp',
  'tcpdump -i eth0 -c 20',
  'netstat -tulpn',
  'mtr -c 5 example.com',
];

// ---------------------------------------------------------------------------
// Mode registry
// ---------------------------------------------------------------------------

export const MODES = [
  // --- Core drills (bespoke pages) ---
  {
    mode: 'flashcard',
    title: 'Flashcard Duel',
    tagline: '140 multiple-choice flashcards across 28 topic tiers',
    icon: '🧠',
    gradient: 'from-purple-500 to-fuchsia-600',
    route: '/interview/flashcard',
    engine: 'bespoke',
    category: 'Core drills',
  },
  {
    mode: 'quest',
    title: 'Quest Mode',
    tagline: '46 real-world scenarios — type the exact command',
    icon: '🗺️',
    gradient: 'from-emerald-500 to-brand-600',
    route: '/interview/quest',
    engine: 'bespoke',
    category: 'Core drills',
  },
  {
    mode: 'typing',
    title: 'Typing Shooter',
    tagline: '46 commands — type them fast and accurately',
    icon: '⌨️',
    gradient: 'from-brand-500 to-amber-600',
    route: '/interview/typing',
    engine: 'bespoke',
    category: 'Core drills',
  },

  // --- Command drills ---
  {
    mode: 'terminal-mission',
    title: 'Terminal Mission',
    tagline: 'Realistic support tickets — type the fix command',
    icon: '🖥️',
    gradient: 'from-slate-600 to-slate-900',
    route: '/interview/drill/terminal-mission',
    engine: 'command',
    category: 'Command drills',
    gemini: true,
  },
  {
    mode: 'build-command',
    title: 'Build the Command',
    tagline: 'Compose the full command from a written requirement',
    icon: '🧰',
    gradient: 'from-cyan-500 to-blue-600',
    route: '/interview/drill/build-command',
    engine: 'command',
    category: 'Command drills',
    gemini: true,
  },
  {
    mode: 'command-chain',
    title: 'Command Chain',
    tagline: 'Build multi-step pipelines that solve a task end-to-end',
    icon: '🔗',
    gradient: 'from-orange-500 to-red-600',
    route: '/interview/drill/command-chain',
    engine: 'command',
    category: 'Command drills',
    gemini: true,
  },
  {
    mode: 'command-speedrun',
    title: 'Command Speedrun',
    tagline: 'Answer command tasks against a running countdown',
    icon: '⏱️',
    gradient: 'from-amber-500 to-yellow-600',
    route: '/interview/drill/command-speedrun',
    engine: 'command',
    category: 'Command drills',
    timed: true,
  },
  {
    mode: 'command-battle',
    title: 'Command Battle',
    tagline: 'Speed + accuracy scoring — race the clock to answer',
    icon: '⚔️',
    gradient: 'from-rose-500 to-pink-700',
    route: '/interview/drill/command-battle',
    engine: 'command',
    category: 'Command drills',
    timed: true,
  },

  // --- Puzzles & quizzes ---
  {
    mode: 'permission-puzzle',
    title: 'Permission Puzzle',
    tagline: 'Read permission strings, octal modes, and chmod',
    icon: '🧩',
    gradient: 'from-violet-500 to-purple-700',
    route: '/interview/drill/permission-puzzle',
    engine: 'mcq',
    category: 'Puzzles & quizzes',
    gemini: true,
  },
  {
    mode: 'wrong-command',
    title: 'Find the Wrong Command',
    tagline: 'Spot the bad command — and learn why it fails',
    icon: '🔍',
    gradient: 'from-red-500 to-orange-600',
    route: '/interview/drill/wrong-command',
    engine: 'mcq',
    category: 'Puzzles & quizzes',
    gemini: true,
  },
  {
    mode: 'command-detective',
    title: 'Command Detective',
    tagline: 'See the output — deduce which command produced it',
    icon: '🕵️',
    gradient: 'from-indigo-500 to-blue-700',
    route: '/interview/drill/command-detective',
    engine: 'mcq',
    category: 'Puzzles & quizzes',
    gemini: true,
  },
  {
    mode: 'predict-output',
    title: 'Predict the Output',
    tagline: 'Guess exactly what a command or script will print',
    icon: '🔮',
    gradient: 'from-fuchsia-500 to-purple-600',
    route: '/interview/drill/predict-output',
    engine: 'mcq',
    category: 'Puzzles & quizzes',
    gemini: true,
  },
  {
    mode: 'fix-mistake',
    title: 'Fix My Mistake',
    tagline: 'Diagnose dangerous or wrong commands and repair them',
    icon: '🛠️',
    gradient: 'from-teal-500 to-emerald-600',
    route: '/interview/drill/fix-mistake',
    engine: 'mcq',
    category: 'Puzzles & quizzes',
    gemini: true,
  },

  // --- Scenarios & incidents ---
  {
    mode: 'admin-tickets',
    title: 'Admin Ticket Queue',
    tagline: 'Clear a shift of real support tickets — earn XP per fix',
    icon: '🎫',
    gradient: 'from-amber-400 to-orange-600',
    route: '/interview/drill/admin-tickets',
    engine: 'ticket',
    category: 'Scenarios & incidents',
  },
  {
    mode: 'incident-response',
    title: 'Incident Response',
    tagline: 'Handle a production incident step by step',
    icon: '🚨',
    gradient: 'from-red-600 to-rose-700',
    route: '/interview/drill/incident-response',
    engine: 'mcq',
    category: 'Scenarios & incidents',
  },
  {
    mode: 'scenario-generator',
    title: 'Scenario Generator',
    tagline: 'Fresh AI-generated admin scenarios every session',
    icon: '🎯',
    gradient: 'from-brand-500 to-fuchsia-600',
    route: '/interview/drill/scenario-generator',
    engine: 'gemini',
    category: 'Scenarios & incidents',
    gemini: true,
  },

  // --- Simulations & labs ---
  {
    mode: 'virtual-lab',
    title: 'Virtual Linux Lab',
    tagline: 'Explore a simulated filesystem with real commands',
    icon: '🧪',
    gradient: 'from-sky-500 to-cyan-600',
    route: '/interview/drill/virtual-lab',
    engine: 'virtual',
    category: 'Simulations & labs',
  },
  {
    mode: 'escape-room',
    title: 'Linux Escape Room',
    tagline: 'Find hidden files and unlock room after room',
    icon: '📂',
    gradient: 'from-emerald-600 to-teal-700',
    route: '/interview/drill/escape-room',
    engine: 'virtual',
    category: 'Simulations & labs',
  },
  {
    mode: 'production-checklist',
    title: 'Production Checklist',
    tagline: 'Deploy and verify nginx — every step in order',
    icon: '📋',
    gradient: 'from-lime-500 to-green-600',
    route: '/interview/drill/production-checklist',
    engine: 'checklist',
    category: 'Simulations & labs',
  },
  {
    mode: 'interview-simulation',
    title: 'Interview Simulation',
    tagline: 'Free-text answers graded by the AI interviewer',
    icon: '🎓',
    gradient: 'from-blue-500 to-indigo-700',
    route: '/interview/drill/interview-simulation',
    engine: 'free',
    category: 'Simulations & labs',
    gemini: true,
  },

  // --- Career & daily ---
  {
    mode: 'career-mode',
    title: 'Junior to Senior Career',
    tagline: 'Climb from Junior Admin to SRE, level by level',
    icon: '🧑‍💼',
    gradient: 'from-slate-500 to-slate-800',
    route: '/interview/drill/career-mode',
    engine: 'career',
    category: 'Career & daily',
  },
  {
    mode: 'career-simulator',
    title: 'Career Simulator',
    tagline: 'Join ABC Bank — tickets, audits, crashes, promotions',
    icon: '🏆',
    gradient: 'from-yellow-500 to-amber-700',
    route: '/interview/drill/career-simulator',
    engine: 'career',
    category: 'Career & daily',
  },
  {
    mode: 'daily-challenge',
    title: 'Daily Linux Challenge',
    tagline: 'A rotating 5-question challenge — new every day',
    icon: '📖',
    gradient: 'from-cyan-600 to-teal-600',
    route: '/interview/drill/daily-challenge',
    engine: 'daily',
    category: 'Career & daily',
    gemini: true,
  },
];

export const CATEGORIES = [
  'Core drills',
  'Command drills',
  'Puzzles & quizzes',
  'Scenarios & incidents',
  'Simulations & labs',
  'Career & daily',
];

export function modeMeta(mode) {
  const m = MODES.find((x) => x.mode === mode);
  if (!m) return { title: humanize(mode), icon: '📘', gradient: 'from-slate-500 to-slate-700', engine: 'mcq' };
  return m;
}

export function humanize(s) {
  return String(s || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Command drills (type the exact command)
// ---------------------------------------------------------------------------

export const DRILL_DATA = {
  'terminal-mission': [
    { prompt: 'Ticket #245 — Finance reports report.sh is not executable. Fix the permissions without changing ownership.', answer: 'chmod +x report.sh', topic: 'Permissions', level: 'Beginner', explanation: 'chmod +x adds execute permission for all without touching ownership.' },
    { prompt: 'Ticket #120 — IT needs the directory /srv/webapp created for a new deploy.', answer: 'mkdir -p /srv/webapp', topic: 'Files', level: 'Beginner', explanation: 'mkdir -p creates the full path and is safe if it already exists.' },
    { prompt: 'Ticket #77 — Copy config.txt to config.backup so we have a rollback copy.', answer: 'cp config.txt config.backup', topic: 'Files', level: 'Beginner', explanation: 'cp copies; mv would move the original.' },
    { prompt: 'Ticket #31 — Move the finished report draft.txt to the published folder final/.', answer: 'mv draft.txt final/', topic: 'Files', level: 'Beginner', explanation: 'mv moves the file; source disappears afterwards.' },
    { prompt: 'Ticket #88 — nginx has crashed. Restart the web service.', answer: 'systemctl restart nginx', topic: 'Services', level: 'Intermediate', explanation: 'systemctl restart stops and starts the unit cleanly.' },
    { prompt: 'Ticket #92 — HR needs a new user account for "hr-ops".', answer: 'useradd hr-ops', topic: 'Users', level: 'Intermediate', explanation: 'useradd creates the account (add -m to create a home directory).' },
    { prompt: 'Ticket #150 — Find every .log file under /var/log larger than 100 MB.', answer: 'find /var/log -name "*.log" -size +100M', topic: 'Search', level: 'Intermediate', explanation: 'find filters by name and size; -size +100M means larger than 100 MiB.' },
    { prompt: 'Ticket #210 — Disk is 92% full. List the top disk consumers under /var.', answer: 'du -xh --max-depth=1 /var | sort -rh | head', topic: 'Disk', level: 'Production', explanation: 'du measures usage per directory; sort -rh orders by size; head keeps the biggest.' },
    { prompt: 'Ticket #212 — Archive every file older than 7 days under /var/log/app into /root/old-logs.tgz.', answer: 'find /var/log/app -type f -mtime +7 -exec tar -czf /root/old-logs.tgz {} +', topic: 'Archives', level: 'Production', explanation: 'find hands the old files to tar which bundles them into one archive.' },
    { prompt: 'Ticket #301 — A process is eating 98% CPU. Identify the heaviest process.', answer: 'top', topic: 'Processes', level: 'Production', explanation: 'top shows live CPU usage; sort by %CPU with the P key or Shift+P.' },
    { prompt: 'Ticket #399 — Security: show only failed login attempts from /var/log/auth.log.', answer: 'grep "Failed password" /var/log/auth.log', topic: 'Security', level: 'Emergency', explanation: 'grep filters the authentication log for brute-force failures.' },
    { prompt: 'Ticket #400 — Emergency: a cryptominer named "xmrig" is running. Stop it immediately.', answer: 'pkill xmrig', topic: 'Processes', level: 'Emergency', explanation: 'pkill kills all processes matching the name; use pkill -9 for hard kill.' },
    { prompt: 'Ticket #255 — Backup the config folder /srv/app/conf into /backups/app-conf.tgz before we patch the server.', answer: 'tar -czf /backups/app-conf.tgz /srv/app/conf', topic: 'Archives', level: 'Production', explanation: 'tar -czf creates a gzip-compressed archive from the source path.' },
    { prompt: 'Ticket #263 — A corrupt config must be restored. Confirm /backups/app-conf.tgz contains nginx.conf WITHOUT extracting it.', answer: 'tar -tzf /backups/app-conf.tgz', topic: 'Archives', level: 'Production', explanation: 'tar -tzf lists the archive contents only; nothing is written to disk.' },
    { prompt: 'Ticket #400 — The app cannot reach the database. Show every IP address on every interface.', answer: 'ip addr show', topic: 'Network', level: 'Intermediate', explanation: 'ip addr show lists all interface IPs to spot a misconfigured or missing address.' },
    { prompt: 'Ticket #402 — Web requests are timing out. Trace the path packets take to db.internal.example.', answer: 'traceroute db.internal.example', topic: 'Network', level: 'Production', explanation: 'traceroute shows every hop so you can see where packets stop.' },
    { prompt: 'Ticket #405 — DNS looks broken. Query the A record for api.example.com directly.', answer: 'dig api.example.com A', topic: 'Network', level: 'Intermediate', explanation: 'dig queries the DNS server directly and prints the A record.' },
    { prompt: 'Ticket #408 — Something is squatting on port 8080. Find the owning process.', answer: 'ss -ltnp | grep :8080', topic: 'Network', level: 'Production', explanation: 'ss -tlnp lists listeners with the owning PID; grep filters port 8080.' },
    { prompt: 'Ticket #412 — Firewall hardening before go-live. Allow HTTPS inbound through ufw.', answer: 'ufw allow 443/tcp', topic: 'Network', level: 'Production', explanation: 'ufw allow 443/tcp opens inbound TCP port 443 for HTTPS traffic.' },
  ],
  'build-command': [
    { prompt: 'Create the user "john".', answer: 'useradd john', topic: 'Users', explanation: 'useradd john creates the account.' },
    { prompt: 'Grant execute permission only to the owner of script.sh.', answer: 'chmod u+x script.sh', topic: 'Permissions', explanation: 'u+x adds execute for the owner only; g/o untouched.' },
    { prompt: 'Copy file.txt to a backup called file-backup.txt.', answer: 'cp file.txt file-backup.txt', topic: 'Files', explanation: 'cp keeps the original and creates a second file.' },
    { prompt: 'Find all files under /var/log modified in the last 24 hours.', answer: 'find /var/log -type f -mtime -1', topic: 'Search', explanation: '-mtime -1 means modified less than 1 day ago.' },
    { prompt: 'Show the 5 processes using the most memory.', answer: 'ps aux --sort=-%mem | head -6', topic: 'Processes', explanation: 'ps aux sorts by memory descending; head keeps the top (plus header).' },
    { prompt: 'Create a compressed archive of the src directory called src.tgz.', answer: 'tar -czf src.tgz src', topic: 'Archives', explanation: '-c create, -z gzip, -f filename.' },
    { prompt: 'Set the owner and group of file.txt to www-data.', answer: 'chown www-data:www-data file.txt', topic: 'Ownership', explanation: 'user:group form sets both in one command.' },
    { prompt: 'Start nginx and ensure it starts automatically at boot.', answer: 'systemctl enable --now nginx', topic: 'Services', explanation: '--now combines enable (boot) and start (now).' },
    { prompt: 'Add john to the sudo group.', answer: 'usermod -aG sudo john', topic: 'Users', explanation: '-aG appends to a supplementary group without removing existing ones.' },
    { prompt: 'List all listening TCP ports.', answer: 'ss -tln', topic: 'Network', explanation: 'ss -t TCP, -l listening, -n numeric ports.' },
    { prompt: 'Count how many lines contain "ERROR" in app.log.', answer: 'grep -c "ERROR" app.log', topic: 'Text', explanation: 'grep -c prints a count of matching lines.' },
    { prompt: 'Make file.txt immutable so even root cannot modify it.', answer: 'chattr +i file.txt', topic: 'Security', explanation: 'The +i immutable attribute blocks changes until removed with chattr -i.' },
    { prompt: 'Create a bzip2-compressed archive of the logs directory called logs.tar.bz2.', answer: 'tar -cjf logs.tar.bz2 logs', topic: 'Archives', explanation: '-j selects bzip2 compression.' },
    { prompt: 'List what is inside the archive backup.tgz without extracting.', answer: 'tar -tzf backup.tgz', topic: 'Archives', explanation: 'tar -tzf prints the file list; -x would extract.' },
    { prompt: 'Show the default route and gateway the machine will use.', answer: 'ip route show', topic: 'Network', explanation: 'ip route show prints the routing table including the default gateway.' },
    { prompt: 'Confirm host example.com is reachable with a single probe.', answer: 'ping -c 1 example.com', topic: 'Network', explanation: 'ping -c 1 sends one ICMP echo request and waits for the reply.' },
    { prompt: 'Resolve the A record for example.com using the system resolver.', answer: 'nslookup example.com', topic: 'Network', explanation: 'nslookup queries the configured nameservers for the A record.' },
    { prompt: 'Show the IP-to-MAC mapping table on this machine.', answer: 'ip neigh show', topic: 'Network', explanation: 'ip neigh (ARP) shows which IPs map to which MAC addresses on the local network.' },
    { prompt: 'Allow SSH (port 22) through the default Ubuntu firewall.', answer: 'ufw allow 22/tcp', topic: 'Network', explanation: 'ufw allow 22/tcp opens inbound SSH so the host stays reachable after enabling the firewall.' },
  ],
  'command-chain': [
    { prompt: 'Find all .log files larger than 100 MB and archive them (feed the list to tar).', answer: 'find . -name "*.log" -size +100M | tar -czf big-logs.tgz -T -', topic: 'Pipelines', explanation: 'tar -T - reads the file list from stdin.' },
    { prompt: 'Count the unique IP addresses in access.log (first column).', answer: "awk '{print $1}' access.log | sort -u | wc -l", topic: 'Pipelines', explanation: 'awk extracts the first column, sort -u dedupes, wc -l counts.' },
    { prompt: 'Find files modified in the last day and delete them.', answer: 'find . -type f -mtime -1 -delete', topic: 'Pipelines', explanation: 'find -delete removes each match as it is found.' },
    { prompt: 'Show the 10 largest files anywhere under /var.', answer: 'find /var -type f -exec du -h {} + | sort -rh | head -10', topic: 'Pipelines', explanation: 'du sizes each file, sort -rh orders descending, head keeps ten.' },
    { prompt: 'Find every java process and kill it.', answer: 'pgrep java | xargs kill -9', topic: 'Pipelines', explanation: 'pgrep lists PIDs, xargs passes them to kill -9.' },
    { prompt: 'Count all lines of code in every .js file under src/.', answer: 'find src -name "*.js" | xargs cat | wc -l', topic: 'Pipelines', explanation: 'cat concatenates all matched files, wc -l counts total lines.' },
    { prompt: 'Compress every PDF in /docs into a single archive.', answer: 'tar -czf docs.tgz /docs/*.pdf', topic: 'Pipelines', explanation: 'Glob expands to all PDFs and tar bundles them.' },
    { prompt: 'List disk usage of the 5 biggest directories in /.', answer: 'du -h --max-depth=1 / | sort -rh | head -5', topic: 'Disk', explanation: 'du per top-level dir, sort descending, head five.' },
    { prompt: 'Check which port nginx is listening on.', answer: 'ss -tlnp | grep nginx', topic: 'Network', explanation: 'ss shows sockets; grep filters the nginx process.' },
    { prompt: 'Find and remove every empty file in /tmp.', answer: 'find /tmp -type f -empty -delete', topic: 'Pipelines', explanation: '-empty matches zero-size files, -delete removes them.' },
    { prompt: 'Create an xz-compressed archive of /var/log while printing each file as it is added.', answer: 'tar -cJvf logs.tar.xz /var/log', topic: 'Pipelines', explanation: '-c create, -J xz, -v verbose, -f output filename.' },
    { prompt: 'Find every process listening on a TCP socket and list them by port.', answer: 'ss -tlnp', topic: 'Network', explanation: 'ss -tlnp lists TCP listeners numerically with owning processes.' },
    { prompt: 'Count how many packets reach host example.com along the route using continuous diagnostics.', answer: 'mtr -c 5 example.com', topic: 'Network', explanation: 'mtr combines ping + traceroute and prints per-hop loss/latency.' },
    { prompt: 'Capture 10 packets on eth0 into /tmp/capture.pcap for analysis.', answer: 'tcpdump -i eth0 -c 10 -w /tmp/capture.pcap', topic: 'Network', explanation: 'tcpdump captures; -c limits packets, -w writes to the pcap file.' },
  ],
  'command-speedrun': [
    { prompt: 'Show your current directory.', answer: 'pwd', topic: 'Basics', explanation: 'pwd prints the working directory.' },
    { prompt: 'List all files including hidden ones.', answer: 'ls -la', topic: 'Files', explanation: '-a includes dotfiles.' },
    { prompt: 'Create a folder called data.', answer: 'mkdir data', topic: 'Files', explanation: 'mkdir creates directories.' },
    { prompt: 'Create an empty file named log.txt.', answer: 'touch log.txt', topic: 'Files', explanation: 'touch creates or updates timestamps.' },
    { prompt: 'Delete temp.txt.', answer: 'rm temp.txt', topic: 'Files', explanation: 'rm removes files.' },
    { prompt: 'Rename a.txt to b.txt.', answer: 'mv a.txt b.txt', topic: 'Files', explanation: 'mv renames (or moves) files.' },
    { prompt: 'Make script.sh executable.', answer: 'chmod +x script.sh', topic: 'Permissions', explanation: 'chmod +x adds execute permission.' },
    { prompt: 'Print the last 10 lines of app.log.', answer: 'tail -10 app.log', topic: 'Text', explanation: 'tail shows the end of a file.' },
    { prompt: 'Count lines in data.txt.', answer: 'wc -l data.txt', topic: 'Text', explanation: 'wc -l counts lines.' },
    { prompt: 'Search for "error" in app.log.', answer: 'grep error app.log', topic: 'Text', explanation: 'grep filters matching lines.' },
    { prompt: 'Show free disk space.', answer: 'df -h', topic: 'Disk', explanation: 'df -h shows filesystem usage.' },
    { prompt: 'Restart nginx.', answer: 'systemctl restart nginx', topic: 'Services', explanation: 'restart stops then starts the unit.' },
    { prompt: 'Compress src into src.tgz.', answer: 'tar -czf src.tgz src', topic: 'Archives', explanation: 'tar -czf creates a gzip-compressed archive.' },
  ],
  'command-battle': [
    { prompt: 'Delete the directory old-build and all its contents.', answer: 'rm -rf old-build', topic: 'Files', explanation: 'rm -rf removes recursively and forcefully.' },
    { prompt: 'Copy config.json to config.backup.', answer: 'cp config.json config.backup', topic: 'Files', explanation: 'cp copies files.' },
    { prompt: 'Create the nested path app/views/templates.', answer: 'mkdir -p app/views/templates', topic: 'Files', explanation: '-p creates parents as needed.' },
    { prompt: 'Show the 5 processes using the most memory.', answer: 'ps aux --sort=-%mem | head -6', topic: 'Processes', explanation: 'sort by memory, keep header + five.' },
    { prompt: 'Compress the src directory into src.tgz.', answer: 'tar -czf src.tgz src', topic: 'Archives', explanation: 'tar -czf creates a gzipped archive.' },
    { prompt: 'Find all .tmp files under /var.', answer: 'find /var -name "*.tmp"', topic: 'Search', explanation: 'find searches by name pattern.' },
    { prompt: 'Set ownership of file to www-data:www-data.', answer: 'chown www-data:www-data file', topic: 'Ownership', explanation: 'user:group ownership.' },
    { prompt: 'List listening TCP ports.', answer: 'ss -tln', topic: 'Network', explanation: 'ss -tln lists TCP listeners.' },
    { prompt: 'Add user bob to the sudo group.', answer: 'usermod -aG sudo bob', topic: 'Users', explanation: '-aG appends to a group.' },
    { prompt: 'Count unique IPs in access.log.', answer: "awk '{print $1}' access.log | sort -u | wc -l", topic: 'Pipelines', explanation: 'extract, dedupe, count.' },
    { prompt: 'Start nginx and enable it at boot.', answer: 'systemctl enable --now nginx', topic: 'Services', explanation: '--now enables and starts.' },
    { prompt: 'Make file.txt immutable.', answer: 'chattr +i file.txt', topic: 'Security', explanation: 'The immutable flag blocks changes.' },
    { prompt: 'List the contents of backup.tgz without extracting.', answer: 'tar -tzf backup.tgz', topic: 'Archives', explanation: 'tar -tzf lists entries only.' },
  ],
};

// ---------------------------------------------------------------------------
// MCQ drills
// ---------------------------------------------------------------------------

export const MCQ_DATA = {
  'permission-puzzle': [
    { prompt: 'Given the permission string -rwxrwxr-x, what is the numeric (octal) mode?', options: ['755', '765', '775', '777'], correctIndex: 2, topic: 'Permissions', explanation: 'rwx=7, rwx=7, r-x=5 → 775.' },
    { prompt: 'A file has mode -rw-rw-r--. Can the group write to it?', options: ['Yes', 'No, group can only read', 'No, group has no access', 'Only if they are root'], correctIndex: 0, topic: 'Permissions', explanation: 'The second triplet is rw- → group has read+write.' },
    { prompt: 'A directory has mode drwxr-x---. Can "others" enter it?', options: ['Yes', 'No', 'Only members of the group', 'Only root'], correctIndex: 1, topic: 'Permissions', explanation: 'The third triplet is --- → others have no access at all.' },
    { prompt: 'Which command changes a file from mode 755 to 644?', options: ['chmod 644 file', 'chmod 755 file', 'chmod 666 file', 'chown 644 file'], correctIndex: 0, topic: 'Permissions', explanation: 'chmod takes the octal mode; 644 = rw-r--r--.' },
    { prompt: 'Which command removes group write permission only?', options: ['chmod g-w file', 'chmod o-w file', 'chmod 755 file', 'chmod g+x file'], correctIndex: 0, topic: 'Permissions', explanation: 'g-w strips write from the group triplet, leaving everything else.' },
    { prompt: 'chmod 754 file produces which permission string?', options: ['-rwxr-xr--', '-rwxrwxr--', '-rwxr-x-w-', '-rwxr--r--'], correctIndex: 0, topic: 'Permissions', explanation: '7=rwx, 5=r-x, 4=r-- → -rwxr-xr--.' },
    { prompt: 'Everyone must be able to enter /srv, but only you should modify it. Best mode?', options: ['755', '777', '700', '644'], correctIndex: 0, topic: 'Permissions', explanation: '755 gives owner full access and others read+execute (to traverse).' },
    { prompt: 'What does the sticky bit do on /tmp?', options: ['Only the owner can delete their own files', 'Anyone can delete anything', 'Files become immutable', 'Files are hidden'], correctIndex: 0, topic: 'Permissions', explanation: 'The sticky bit (1777 on /tmp) prevents users from deleting others files.' },
    { prompt: 'Which command sets the setgid bit on a directory?', options: ['chmod g+s dir', 'chmod +t dir', 'chmod u+s dir', 'chmod 777 dir'], correctIndex: 0, topic: 'Permissions', explanation: 'g+s adds the setgid bit; new files inherit the directory group.' },
    { prompt: 'A script owned by root shows -rwsr-xr-x. Which special bit is set?', options: ['setuid', 'setgid', 'sticky', 'none'], correctIndex: 0, topic: 'Permissions', explanation: 's in the owner execute slot = setuid; the script runs as root.' },
    { prompt: 'What numeric mode is represented by rw-r--r--?', options: ['644', '755', '600', '444'], correctIndex: 0, topic: 'Permissions', explanation: 'rw- (6), r-- (4), r-- (4) → 644.' },
    { prompt: 'Give only the owner execute permission on script.sh.', options: ['chmod u+x script.sh', 'chmod +x script.sh', 'chmod g+x script.sh', 'chmod 777 script.sh'], correctIndex: 0, topic: 'Permissions', explanation: 'u+x restricts the change to the owner.' },
  ],
  'wrong-command': [
    { prompt: 'You need to copy file.txt to backup.txt. Which command is WRONG?', options: ['mv file.txt backup.txt', 'cp file.txt backup.txt', 'install file.txt backup.txt', 'cp -a file.txt backup.txt'], correctIndex: 0, topic: 'Files', explanation: 'mv renames (the original disappears) — it is not a copy.' },
    { prompt: 'Delete the directory old-build and everything inside it. Which is WRONG?', options: ['rmdir old-build', 'rm -rf old-build', 'find old-build -delete', 'rm -r old-build'], correctIndex: 0, topic: 'Files', explanation: 'rmdir only removes EMPTY directories and will fail here.' },
    { prompt: 'Show the last 20 lines of error.log. Which is WRONG?', options: ['head -20 error.log', 'tail -20 error.log', 'tail -n 20 error.log', 'sed -n "20,$p" error.log'], correctIndex: 0, topic: 'Text', explanation: 'head prints the FIRST lines; tail prints the end.' },
    { prompt: 'Make script.sh executable. Which is WRONG?', options: ['chmod +x script.sh', 'chmod a+x script.sh', 'chmod 755 script.sh', 'chown root script.sh'], correctIndex: 3, topic: 'Permissions', explanation: 'chown changes ownership, not permissions.' },
    { prompt: 'List all files including hidden ones. Which is WRONG?', options: ['ls', 'ls -a', 'ls -A', 'ls -la'], correctIndex: 0, topic: 'Files', explanation: 'Plain ls hides dotfiles; -a / -A include them.' },
    { prompt: 'Show free disk space. Which is WRONG?', options: ['df -h', 'df -H', 'df .', 'free -h'], correctIndex: 3, topic: 'Disk', explanation: 'free shows memory, not disk.' },
    { prompt: 'Find a process by name. Which is WRONG?', options: ['ps aux | grep nginx', 'pgrep nginx', 'pidof nginx', 'killall nginx'], correctIndex: 3, topic: 'Processes', explanation: 'killall KILLS the process — it does not find it.' },
    { prompt: 'Search for the word "error" inside file.txt. Which is WRONG?', options: ['grep error file.txt', 'grep -i error file.txt', 'sed -n /error/p file.txt', 'rm file.txt'], correctIndex: 3, topic: 'Text', explanation: 'rm deletes the file — you would lose the data.' },
    { prompt: 'Create a new user bob. Which is WRONG?', options: ['useradd bob', 'adduser bob', 'useradd -m bob', 'passwd bob'], correctIndex: 3, topic: 'Users', explanation: 'passwd only sets a password for an EXISTING user.' },
    { prompt: 'Check the number of lines in data.txt. Which is WRONG?', options: ['wc -l data.txt', 'cat data.txt | wc -l', 'grep -c "" data.txt', 'rm data.txt'], correctIndex: 3, topic: 'Text', explanation: 'rm destroys the file instead of counting.' },
    { prompt: 'Compress a directory into a tarball. Which is WRONG?', options: ['tar -czf a.tar.gz dir', 'tar -czvf a.tar.gz dir', 'tar -xzf a.tar.gz', 'gzip -c dir > a.tar.gz'], correctIndex: 2, topic: 'Archives', explanation: '-x extracts; the others create/compress.' },
    { prompt: 'Restart the network service. Which is WRONG?', options: ['systemctl restart NetworkManager', 'systemctl status NetworkManager', 'systemctl try-restart NetworkManager', 'reboot'], correctIndex: 3, topic: 'Services', explanation: 'reboot restarts the whole machine — far heavier than needed.' },
    { prompt: 'Extract backup.tar.gz into the current folder. Which is WRONG?', options: ['tar -xzf backup.tar.gz', 'tar -tzf backup.tar.gz', 'tar -xzvf backup.tar.gz', 'tar -xzf backup.tar.gz -C .'], correctIndex: 1, topic: 'Archives', explanation: 'tar -tzf only LISTS the contents; -x is the flag that extracts.' },
    { prompt: 'Compress app.log into app.log.gz while keeping the original. Which is WRONG?', options: ['gzip app.log', 'gzip -c app.log > app.log.gz', 'gzip -k app.log', 'gzip -9 -k app.log'], correctIndex: 0, topic: 'Archives', explanation: 'Plain gzip replaces the original file; -k keeps it, -c writes to stdout so you can redirect.' },
    { prompt: 'Check whether host example.com is reachable. Which is WRONG?', options: ['ss -tlnp', 'ping -c 3 example.com', 'curl -I example.com', 'traceroute example.com'], correctIndex: 0, topic: 'Network', explanation: 'ss shows local listening sockets — it never sends packets to a remote host.' },
    { prompt: 'Look up the DNS A record for example.com. Which is WRONG?', options: ['cat /etc/hosts', 'dig example.com A', 'nslookup example.com', 'host example.com'], correctIndex: 0, topic: 'Network', explanation: '/etc/hosts is a local static file, not a live DNS lookup.' },
    { prompt: 'List every listening TCP port with its process. Which is WRONG?', options: ['ping localhost', 'ss -tlnp', 'netstat -tulpn', 'lsof -i -nP'], correctIndex: 0, topic: 'Network', explanation: 'ping tests reachability; it does not enumerate ports.' },
    { prompt: 'Allow HTTPS inbound through the firewall. Which is WRONG?', options: ['ufw deny 443/tcp', 'ufw allow 443/tcp', 'ufw allow https', 'ufw allow 443'], correctIndex: 0, topic: 'Network', explanation: 'deny blocks the port — HTTPS traffic would be refused, not allowed.' },
  ],
  'command-detective': [
    { prompt: 'Output: /dev/sda2 80G 74G 6G 93% / — which command produced it?', options: ['df -h', 'free -h', 'du -sh /', 'lsblk'], correctIndex: 0, topic: 'Disk', explanation: 'df -h prints filesystems with size/used/avail/use% columns.' },
    { prompt: 'Output: total 16G, used 12G, free 4G, swap 2G. Which command?', options: ['free -h', 'df -h', 'uptime', 'top'], correctIndex: 0, topic: 'Processes', explanation: 'free reports memory and swap in human units.' },
    { prompt: 'Output: PID USER TIME COMMAND / 1 root 0:01 /sbin/init / 4821 ubuntu 1:24 java. Which command?', options: ['ps aux', 'ss -tln', 'ls -la', 'who'], correctIndex: 0, topic: 'Processes', explanation: 'ps aux lists every process with PID, user, time and command.' },
    { prompt: 'Output: drwxr-xr-x 2 root root 4096 Mar 1 12:00 bin. Which command?', options: ['ls -la', 'find .', 'file bin', 'stat bin'], correctIndex: 0, topic: 'Files', explanation: 'ls -la shows perms, links, owner, size, date and name.' },
    { prompt: 'Output: USER=root HOME=/root SHELL=/bin/bash PATH=/usr/bin. Which command?', options: ['env', 'cat /etc/profile', 'echo $USER', 'whoami'], correctIndex: 0, topic: 'Environment', explanation: 'env prints the whole environment as VAR=value lines.' },
    { prompt: 'Output: 12:00:01 up 3 days, 2 users, load average: 0.50, 0.60, 0.70. Which command?', options: ['uptime', 'who', 'date', 'w'], correctIndex: 0, topic: 'System', explanation: 'uptime shows current time, uptime, users and load averages.' },
    { prompt: 'Output: Linux lab 5.15.0-91-generic #101-Ubuntu SMP ... x86_64 GNU/Linux. Which command?', options: ['uname -a', 'hostnamectl', 'lscpu', 'cat /etc/os-release'], correctIndex: 0, topic: 'System', explanation: 'uname -a prints kernel name, host, version and architecture.' },
    { prompt: 'Output: NAME MAJ:MIN RM SIZE RO TYPE MOUNTPOINT sda 8:0 0 80G 0 disk sda1 8:1 0 80G 0 part /. Which command?', options: ['lsblk', 'df -h', 'fdisk -l', 'mount'], correctIndex: 0, topic: 'Disk', explanation: 'lsblk lists block devices in a tree with sizes and mountpoints.' },
    { prompt: 'Output: 127.0.0.1 localhost / 10.0.0.5 lab. Which command?', options: ['cat /etc/hosts', 'hostname', 'cat /etc/hostname', 'dig lab'], correctIndex: 0, topic: 'Network', explanation: 'hostname-to-IP mappings live in /etc/hosts.' },
    { prompt: 'Output: tcp 0 0 0.0.0.0:22 0.0.0.0:* LISTEN 1234/sshd. Which command?', options: ['ss -tlnp', 'ps aux', 'netstat -r', 'ping localhost'], correctIndex: 0, topic: 'Network', explanation: 'ss shows listening TCP sockets and the owning process with -p.' },
    { prompt: 'Output: total 12 / -rw-r--r-- 1 root root 512 Mar 1 10:00 app.conf. Which command?', options: ['ls -lh', 'ls', 'df -h', 'du -sh .'], correctIndex: 0, topic: 'Files', explanation: 'ls -lh adds human-readable sizes to the long listing.' },
    { prompt: 'Output: nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin. Which command/file?', options: ['cat /etc/passwd', 'cat /etc/shadow', 'getent hosts', 'id nobody'], correctIndex: 0, topic: 'Users', explanation: 'User account entries with UID/GID/shell live in /etc/passwd.' },
    { prompt: 'Output: app.log.gz: gzip compressed data, from Unix, original size 1048576. Which command?', options: ['file app.log.gz', 'ls -lh app.log.gz', 'stat app.log.gz', 'gzip -d app.log.gz'], correctIndex: 0, topic: 'Archives', explanation: 'file detects and prints the compression format and original size.' },
    { prompt: 'Output: etc/passwd / etc/shadow / etc/hostname / etc/nginx/nginx.conf. Which command?', options: ['tar -tzf etc.tar.gz', 'ls -l /etc', 'find /etc -name "*.conf"', 'cat etc.tar.gz'], correctIndex: 0, topic: 'Archives', explanation: 'tar -tzf lists archive contents without extracting them.' },
    { prompt: 'Output: 10.0.0.1 via eth0 dev / default via 10.0.0.1 dev eth0. Which command?', options: ['ip route show', 'ip addr show', 'cat /etc/resolv.conf', 'ip neigh show'], correctIndex: 0, topic: 'Network', explanation: 'ip route shows the routing table including the default gateway.' },
    { prompt: 'Output: 64 bytes from 93.184.216.34: icmp_seq=1 ttl=54 time=21.3 ms. Which command?', options: ['ping -c 1 example.com', 'traceroute example.com', 'curl example.com', 'dig example.com'], correctIndex: 0, topic: 'Network', explanation: 'The icmp_seq / ttl / time lines are the signature of a ping reply.' },
    { prompt: 'Output: eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500 / inet 10.0.0.5. Which command?', options: ['ifconfig eth0', 'ip route show', 'ss -tlnp', 'hostname -I'], correctIndex: 0, topic: 'Network', explanation: 'The <UP,BROADCAST,RUNNING> flags and inet line are the classic ifconfig output.' },
  ],
  'predict-output': [
    { prompt: 'echo $((3 + 4 * 2)) — what prints?', options: ['11', '14', '20', '35'], correctIndex: 0, topic: 'Shell', explanation: 'Arithmetic follows precedence: 4*2=8, 3+8=11.' },
    { prompt: 'echo {a,b}{1,2} — what prints?', options: ['a1 a2 b1 b2', 'a b 1 2', 'ab12', 'a,b,1,2'], correctIndex: 0, topic: 'Shell', explanation: 'Brace expansion creates all combinations.' },
    { prompt: 'echo "a b c" | tr " " "-" — what prints?', options: ['a-b-c', 'a b c', 'abc', 'a b-c'], correctIndex: 0, topic: 'Shell', explanation: 'tr maps spaces to dashes.' },
    { prompt: 'printf "%s" hello | wc -c — what prints?', options: ['5', '6', 'hello', '0'], correctIndex: 0, topic: 'Text', explanation: 'printf without a newline yields 5 characters; wc -c counts bytes.' },
    { prompt: 'seq 1 5 | paste -sd+ | bc — what prints?', options: ['15', '5', '12345', '10'], correctIndex: 0, topic: 'Shell', explanation: '1+2+3+4+5 = 15.' },
    { prompt: 'echo hello | grep -c "l" — what prints?', options: ['2', '1', 'hello', '0'], correctIndex: 1, topic: 'Text', explanation: 'grep -c counts matching LINES; "hello" is a single line, so 1 (the letter count is irrelevant).' },
    { prompt: 'x=10; echo $x — what prints?', options: ['10', 'x', '$x', 'nothing'], correctIndex: 0, topic: 'Shell', explanation: 'Assignment then expansion prints 10.' },
    { prompt: 'echo $((10/4)) — what prints?', options: ['2', '2.5', '10', 'error'], correctIndex: 0, topic: 'Shell', explanation: 'Shell arithmetic is integer: 10/4 = 2 (remainder dropped).' },
    { prompt: 'echo -n abc | wc -c — what prints?', options: ['3', '4', 'abc', '0'], correctIndex: 0, topic: 'Text', explanation: '-n suppresses the newline so wc counts exactly 3 bytes.' },
    { prompt: 'head -2 file (file contains lines 1,2,3,4) — what prints?', options: ['1 2', '1', '1 2 3', '2'], correctIndex: 0, topic: 'Text', explanation: 'head -2 shows the first two lines.' },
    { prompt: 'tail -1 file (file contains lines 1,2,3,4) — what prints?', options: ['4', '1', '3', '2'], correctIndex: 0, topic: 'Text', explanation: 'tail -1 shows the last line only.' },
    { prompt: 'echo "hi there" | wc -w — what prints?', options: ['2', '8', '1', '0'], correctIndex: 0, topic: 'Text', explanation: 'wc -w counts words: "hi" and "there".' },
  ],
  'fix-mistake': [
    { prompt: 'Someone ran chmod 777 /etc/passwd. Why is this dangerous?', options: ['It gives write access to every user on a critical system file', 'It deletes the file', 'It makes the file invisible', 'It is fine'], correctIndex: 0, topic: 'Security', explanation: 'World-writable system files let anyone modify accounts or escalate privileges.' },
    { prompt: 'How do you repair chmod 777 /etc/passwd?', options: ['chmod 644 /etc/passwd', 'chmod 777 /etc/shadow', 'rm /etc/passwd', 'chmod 000 /etc/passwd'], correctIndex: 0, topic: 'Security', explanation: 'System config files should be root-owned and 644: rw-r--r--.' },
    { prompt: 'An admin runs rm -rf /tmp/*. Should they?', options: ['Only with certainty nothing else uses /tmp', 'Always — /tmp is temporary', 'Never', 'Only as root'], correctIndex: 0, topic: 'Files', explanation: 'Other users/apps may store state in /tmp; check first.' },
    { prompt: 'Why is sudo rm -rf / catastrophic?', options: ['It deletes the entire filesystem', 'It is too slow', 'It only removes /tmp', 'It changes ownership'], correctIndex: 0, topic: 'Security', explanation: 'rm -rf / from root recursively deletes everything unrecoverable.' },
    { prompt: 'cat a.txt > a.txt — what happens to a.txt?', options: ['It becomes empty (truncated before cat reads)', 'It stays unchanged', 'It doubles in size', 'It is removed'], correctIndex: 0, topic: 'Shell', explanation: 'The shell truncates the file before the command runs, destroying it.' },
    { prompt: 'grep root /etc/passwd also matches /root paths. What makes it precise?', options: ['grep "^root:" /etc/passwd', 'grep root /etc/shadow', 'grep -v root', 'sort /etc/passwd'], correctIndex: 0, topic: 'Text', explanation: '^root: anchors the match to the start of the account line.' },
    { prompt: 'chmod 000 file.txt to "lock" a file — what is the problem?', options: ['No one (not even you) can access it; recovery needs root', 'It deletes the file', 'It hides the file', 'It is fine'], correctIndex: 0, topic: 'Permissions', explanation: '000 strips all access for owner, group and others.' },
    { prompt: 'Disk is 92% full but ls finds no big files. Which command finds the real consumer?', options: ['du -h --max-depth=1 / | sort -rh', 'df -h', 'free -h', 'ls -la /'], correctIndex: 0, topic: 'Disk', explanation: 'du measures per-directory usage so you can trace where space went.' },
    { prompt: 'mv file.txt backup/ was meant to copy, but file.txt is gone. Correct command?', options: ['cp file.txt backup/', 'cp -r backup/ file.txt', 'ln file.txt backup/', 'touch file.txt'], correctIndex: 0, topic: 'Files', explanation: 'cp copies (source stays); mv moves.' },
    { prompt: 'chown john file.txt changed the owner, but you wanted the group. Correct fix?', options: ['chgrp john file.txt', 'chown john: file.txt', 'chmod g+w file.txt', 'usermod -aG john'], correctIndex: 0, topic: 'Ownership', explanation: 'chgrp sets the group; the group of a file is not its owner.' },
    { prompt: 'sed -i "s/foo/bar/" config.json edits in place. What should you do first?', options: ['Back up: sed -i.bak "s/foo/bar/" config.json', 'Nothing, -i is safe', 'chmod 777 first', 'Run it as root'], correctIndex: 0, topic: 'Text', explanation: '-i has no undo; giving the extension .bak writes the original first.' },
    { prompt: 'An admin ran systemctl stop nginx to "restart" it. What should they have used?', options: ['systemctl restart nginx', 'systemctl start nginx', 'systemctl daemon-reload', 'nginx -s stop'], correctIndex: 0, topic: 'Services', explanation: 'restart stops then starts; stop leaves it down.' },
    { prompt: 'A script tried to compress a whole folder with gzip and failed with "is a directory". Correct approach?', options: ['tar -czf backup.tar.gz /var/lib/mysql', 'gzip -r /var/lib/mysql', 'chmod 777 then gzip', 'split the files first'], correctIndex: 0, topic: 'Archives', explanation: 'gzip works on single files; to compress a whole tree, archive it with tar first (using -z for gzip).' },
    { prompt: 'An admin restored /backup/etc.tar.gz with tar -xf and it worked. What was missing from the review?', options: ['Verifying the restored files match the live ones (e.g. diff)', 'Compressing the archive', 'Running it as root', 'Nothing'], correctIndex: 0, topic: 'Archives', explanation: 'A backup is only proven once you restore it and compare the data with the source.' },
    { prompt: 'An app is unreachable but ssh still works. What is the FIRST networking check?', options: ['ss -tlnp | grep :8080', 'rm -rf /tmp/*', 'apt update', 'reboot'], correctIndex: 0, topic: 'Network', explanation: 'Check whether the service actually listens on its port before touching anything else.' },
    { prompt: 'ping to an IP works but DNS lookups fail. Where is the fault?', options: ['The resolver config (/etc/resolv.conf)', 'The network cable', 'The kernel', 'The firewall'], correctIndex: 0, topic: 'Network', explanation: 'IP-level connectivity is fine; the failure is name resolution, so check the nameserver config.' },
    { prompt: 'Firewall was just enabled and SSH sessions dropped. How do you regain access?', options: ['Ask the console/out-of-band access and allow 22', 'Reboot the machine', 'Unplug the cable', 'Wait for the firewall to expire'], correctIndex: 0, topic: 'Network', explanation: 'Always allow SSH (ufw allow 22) before enabling ufw; recover via console or a temporary allow.' },
  ],
  'incident-response': [
    { prompt: 'ALERT: CPU at 98%, application unavailable, users cannot log in. Your FIRST step?', options: ['top', 'apt update', 'rm -rf /tmp/*', 'reboot'], correctIndex: 0, topic: 'Incident', explanation: 'top shows the culprit process before you change anything.' },
    { prompt: 'top shows a java process at 98% CPU. What next?', options: ['kill -9 the runaway PID', 'Ignore it and restart the app', 'Run apt update', 'Check df -h'], correctIndex: 0, topic: 'Incident', explanation: 'A runaway process must be stopped first.' },
    { prompt: 'The app restarts but crashes again. Where do you look?', options: ['journalctl -u myapp', 'cat /etc/passwd', 'ls /var/log/nginx', 'df -h'], correctIndex: 0, topic: 'Incident', explanation: 'The service journal shows why it exited.' },
    { prompt: 'Users cannot log in. Which file lists local accounts?', options: ['/etc/passwd', '/var/log/auth.log', '/etc/fstab', '/usr/bin'], correctIndex: 0, topic: 'Incident', explanation: 'Accounts are defined in /etc/passwd (passwords in /etc/shadow).' },
    { prompt: 'auth.log shows thousands of "Failed password" from one IP — a brute force. Next step?', options: ['Block that IP with ufw/iptables', 'Change your own password', 'Delete auth.log', 'Disable SSH entirely'], correctIndex: 0, topic: 'Incident', explanation: 'Block the attacker at the firewall first.' },
    { prompt: 'The database stopped. You suspect no disk space. Which check?', options: ['df -h', 'ps aux', 'free -h', 'uptime'], correctIndex: 0, topic: 'Incident', explanation: 'df shows whether the filesystem is full.' },
    { prompt: 'A huge log file is filling the disk. Which cleanup is careful?', options: ['Find it, then truncate/rotate it', 'rm -rf /var/log', 'Delete everything in /tmp', 'rm -rf /usr'], correctIndex: 0, topic: 'Incident', explanation: 'Target the specific file; rotate or truncate to keep disk free.' },
    { prompt: 'The service is fixed. Ensure it starts automatically on boot.', options: ['systemctl enable myapp', 'systemctl start myapp', 'nohup myapp &', 'service myapp restart'], correctIndex: 0, topic: 'Incident', explanation: 'enable adds the boot-time symlink; start runs it now.' },
    { prompt: 'Post-incident: show the most recent errors in the journal.', options: ['journalctl -p err -n 100', 'ls -la', 'cat /etc/passwd', 'top'], correctIndex: 0, topic: 'Incident', explanation: '-p err filters priority, -n limits to the last 100 lines.' },
  ],
};

// ---------------------------------------------------------------------------
// Admin ticket queue
// ---------------------------------------------------------------------------

export const TICKET_DATA = {
  'admin-tickets': [
    { priority: 'critical', title: 'Application will not start', prompt: 'The payments app service "myapp" is failing. Start it.', answer: 'systemctl start myapp', topic: 'Services', explanation: 'systemctl start brings the unit up.' },
    { priority: 'high', title: 'Disk usage reached 92%', prompt: 'Identify the biggest directories on / so we can free space.', answer: 'du -h --max-depth=1 / | sort -rh | head -20', topic: 'Disk', explanation: 'du measures per-directory usage; sort finds the largest.' },
    { priority: 'low', title: 'Create a new user for HR', prompt: 'HR needs an account "hr-admin". Create it.', answer: 'useradd hr-admin', topic: 'Users', explanation: 'useradd creates the account.' },
    { priority: 'critical', title: 'Web server is down', prompt: 'nginx stopped. Show the last 50 journal lines to diagnose.', answer: 'journalctl -u nginx -n 50', topic: 'Logs', explanation: 'journalctl -u filters by unit and -n limits lines.' },
    { priority: 'high', title: 'No space left on device', prompt: 'Show disk usage by mounted filesystems.', answer: 'df -h', topic: 'Disk', explanation: 'df -h shows usage per filesystem in human units.' },
    { priority: 'high', title: 'Scheduled job is not running', prompt: 'List the current user crontab entries.', answer: 'crontab -l', topic: 'Scheduling', explanation: 'crontab -l prints the cron table.' },
    { priority: 'low', title: 'Grant developers read access', prompt: 'Give the group read access on /srv/app for the devs.', answer: 'chmod g+r /srv/app', topic: 'Permissions', explanation: 'g+r adds read for the group class.' },
    { priority: 'critical', title: 'Rogue process eating CPU', prompt: 'A process with PID 4821 is at 99% CPU. Terminate it immediately.', answer: 'kill -9 4821', topic: 'Processes', explanation: 'kill -9 force-kills the process.' },
    { priority: 'high', title: 'DNS seems broken', prompt: 'Check which DNS servers the machine is configured to use.', answer: 'cat /etc/resolv.conf', topic: 'Network', explanation: 'resolv.conf lists the nameservers.' },
    { priority: 'low', title: 'Schedule the nightly backup', prompt: 'Run /opt/backup.sh every night at 2am via cron.', answer: 'echo "0 2 * * * /opt/backup.sh" | crontab -', topic: 'Scheduling', explanation: 'The echoed cron line is installed with crontab -.', },
    { priority: 'high', title: 'Confirm a backup before restoring', prompt: 'nginx.conf was corrupted. Verify /backups/nginx-conf.tgz contains it WITHOUT extracting.', answer: 'tar -tzf /backups/nginx-conf.tgz', topic: 'Archives', explanation: 'tar -tzf lists the archive contents without touching the filesystem.' },
    { priority: 'high', title: 'Interface has no IP', prompt: 'eth0 shows no address after boot. Display every interface and its addresses.', answer: 'ip addr show', topic: 'Network', explanation: 'ip addr show reveals missing/misconfigured addresses across interfaces.' },
    { priority: 'high', title: 'Service not listening', prompt: 'The app is up but unreachable. Show which TCP ports are actually listening.', answer: 'ss -tln', topic: 'Network', explanation: 'ss -tln lists all listening TCP ports numerically.' },
    { priority: 'critical', title: 'DNS outage for users', prompt: 'Users cannot resolve app.linuxlab.local. Query its A record directly.', answer: 'dig app.linuxlab.local A', topic: 'Network', explanation: 'dig queries the DNS server directly, bypassing any local cache.' },
    { priority: 'high', title: 'Firewall hardening', prompt: 'Before go-live, allow inbound HTTPS (443) through ufw.', answer: 'ufw allow 443/tcp', topic: 'Network', explanation: 'ufw allow 443/tcp opens inbound HTTPS so the site is reachable.' },
  ],
};

// ---------------------------------------------------------------------------
// Production checklist (ordered steps)
// ---------------------------------------------------------------------------

export const CHECKLIST_DATA = {
  'production-checklist': [
    { title: 'Update packages', prompt: 'Refresh the APT package indexes.', answer: 'apt update', topic: 'Packages', explanation: 'apt update downloads the package index.' },
    { title: 'Install nginx', prompt: 'Install the nginx web server.', answer: 'apt install -y nginx', topic: 'Packages', explanation: '-y answers yes to prompts.' },
    { title: 'Enable the service', prompt: 'Make nginx start automatically at boot.', answer: 'systemctl enable nginx', topic: 'Services', explanation: 'enable creates the boot-time symlink.' },
    { title: 'Start the service', prompt: 'Start nginx now.', answer: 'systemctl start nginx', topic: 'Services', explanation: 'start launches the unit.' },
    { title: 'Verify status', prompt: 'Confirm nginx is active and check its status.', answer: 'systemctl status nginx', topic: 'Services', explanation: 'status shows active state and recent logs.' },
    { title: 'Test the response', prompt: 'Check that the server answers locally with curl.', answer: 'curl -I http://localhost', topic: 'Network', explanation: '-I fetches headers; 200/OK means it responds.' },
    { title: 'Open the firewall', prompt: 'Allow HTTPS (port 443) through ufw.', answer: 'ufw allow 443/tcp', topic: 'Network', explanation: 'ufw allow 443/tcp opens the port for TLS traffic.' },
    { title: 'Confirm the port', prompt: 'Show which port nginx is actually listening on.', answer: 'ss -tlnp | grep nginx', topic: 'Network', explanation: 'ss lists listening sockets; grep filters nginx.' },
    { title: 'Verify external reachability', prompt: 'Trace the route packets take to the public site before announcing go-live.', answer: 'traceroute example.com', topic: 'Network', explanation: 'traceroute shows every hop so reachability issues are visible immediately.' },
    { title: 'Verify DNS records', prompt: 'Confirm the site A record resolves to the correct IP.', answer: 'dig example.com A', topic: 'Network', explanation: 'dig prints the A record returned by the authoritative resolver.' },
  ],
};

// ---------------------------------------------------------------------------
// Interview simulation (free text, AI-graded)
// ---------------------------------------------------------------------------

export const FREE_DATA = {
  'interview-simulation': [
    { prompt: 'Explain what chmod 755 means and when you would use it.', topic: 'Permissions', model: 'rwxr-xr-x = owner full, group/others read+execute. Used for files everyone can run (scripts, binaries).' },
    { prompt: 'What is the difference between a soft (symbolic) link and a hard link?', topic: 'Filesystem', model: 'Soft link points to a path, breaks if target moves, can cross filesystems. Hard link shares the same inode, survives original name removal.' },
    { prompt: 'A process is eating 100% CPU. Walk through how you would find and deal with it.', topic: 'Processes', model: 'Use top/ps to find PID, verify it is the culprit, then kill (SIGTERM) then kill -9 if needed.' },
    { prompt: 'How do you check disk space, and how do you find which files/directories are consuming it?', topic: 'Disk', model: 'df -h for filesystems; du -h --max-depth=1 | sort -rh to trace consumers.' },
    { prompt: 'What is the difference between systemctl enable and systemctl start?', topic: 'systemd', model: 'enable adds a boot-time symlink; start runs the unit now. Use --now for both.' },
    { prompt: 'Explain the difference between TCP and UDP and give a use case for each.', topic: 'Network', model: 'TCP is connection-oriented/reliable (web, SSH); UDP is connectionless/fast (DNS, video streaming).' },
    { prompt: 'You see repeated "Failed password" in /var/log/auth.log. What do you do?', topic: 'Security', model: 'Identify source IP, block with firewall (ufw/iptables), check for accounts compromised, harden SSH (fail2ban, key auth).' },
    { prompt: 'What is the difference between /etc/passwd and /etc/shadow?', topic: 'Users', model: 'passwd holds account info (UID, shell, home); shadow holds encrypted passwords, readable only by root.' },
    { prompt: 'What does the sticky bit do, and where would you find it?', topic: 'Permissions', model: 'Restricts deletion to file owners; used on shared dirs like /tmp (mode 1777).' },
    { prompt: 'How would you troubleshoot a service that keeps crashing?', topic: 'Troubleshooting', model: 'systemctl status, journalctl -u for logs, check configs, resource limits, then restart or escalate.' },
    { prompt: 'Explain the difference between gzip, bzip2 and xz, and when you would use each.', topic: 'Archives', model: 'All compress a single file. gzip is fastest with a modest ratio, bzip2 compresses better, xz gives the best ratio but is slowest. With tar, pick the flag per need: -z gzip, -j bzip2, -J xz. Use xz for long-term storage of logs, gzip where speed matters.' },
    { prompt: 'How do you prove a backup actually works before you rely on it?', topic: 'Archives', model: 'Restore it into a scratch directory (tar -xf backup.tar.gz -C /tmp/restore), compare the restored data with the source using diff/cmp, and confirm the files are byte-identical.' },
    { prompt: 'Walk through how you would diagnose a host that is up but unreachable by name.', topic: 'Network', model: 'Split the problem: check the local stack (ip addr show, ip route show), confirm the service listens (ss -tlnp), then test reachability (ping, traceroute) and name resolution (dig, nslookup). Each layer narrows the fault.' },
    { prompt: 'What is the difference between ping and traceroute, and when is each the right tool?', topic: 'Network', model: 'ping tests end-to-end reachability and latency to one host; traceroute reveals each hop (RTT + name/IP) so you can find where packets stop. Use ping for a quick up/down, traceroute when ping fails to find the break.' },
    { prompt: 'How does a DNS lookup actually work when you type nslookup example.com?', topic: 'Network', model: 'The resolver queries a configured nameserver, which walks the root, TLD and authoritative servers to fetch the A/AAAA record, then returns it with a TTL for caching.' },
  ],
};

// ---------------------------------------------------------------------------
// Career modes (level / day progression)
// ---------------------------------------------------------------------------

export const CAREER_DATA = {
  'career-mode': {
    title: 'Junior to Senior Career',
    levels: [
      {
        rank: 'Junior Linux Admin',
        salary: '$30k',
        story: 'Your first week: keep the servers patched and folders tidy.',
        questions: [
          { prompt: 'Create the directory ~/projects.', answer: 'mkdir ~/projects', topic: 'Files' },
          { prompt: 'Create an empty file named README.', answer: 'touch README', topic: 'Files' },
          { prompt: 'List all files including hidden ones.', answer: 'ls -la', topic: 'Files' },
          { prompt: 'Copy README to README.backup.', answer: 'cp README README.backup', topic: 'Files' },
        ],
      },
      {
        rank: 'Linux Admin',
        salary: '$55k',
        story: 'Now you own user accounts, services and log sanity.',
        questions: [
          { prompt: 'Create a new user "svc".', answer: 'useradd svc', topic: 'Users' },
          { prompt: 'Make script.sh executable.', answer: 'chmod +x script.sh', topic: 'Permissions' },
          { prompt: 'Restart the nginx service.', answer: 'systemctl restart nginx', topic: 'Services' },
          { prompt: 'Show the last 10 lines of app.log.', answer: 'tail -10 app.log', topic: 'Text' },
        ],
      },
      {
        rank: 'Senior Admin',
        salary: '$80k',
        story: 'You handle capacity, search and the journal.',
        questions: [
          { prompt: 'Find all files larger than 500 MB under /var.', answer: 'find /var -size +500M', topic: 'Search' },
          { prompt: 'Create a gzip archive of /var/log/app.', answer: 'tar -czf app-logs.tgz /var/log/app', topic: 'Archives' },
          { prompt: 'Show the last 50 error-level journal lines.', answer: 'journalctl -p err -n 50', topic: 'Logs' },
          { prompt: 'List all listening TCP ports.', answer: 'ss -tln', topic: 'Network' },
        ],
      },
      {
        rank: 'DevOps',
        salary: '$100k',
        story: 'Deployments, firewalls and automation are yours.',
        questions: [
          { prompt: 'Check that a web endpoint responds with headers.', answer: 'curl -I https://example.com', topic: 'Network' },
          { prompt: 'Allow HTTPS through ufw.', answer: 'ufw allow 443/tcp', topic: 'Network' },
          { prompt: 'Install a cron entry that runs backup.sh daily at 3am.', answer: 'echo "0 3 * * * /opt/backup.sh" | crontab -', topic: 'Scheduling' },
          { prompt: 'Sync a local folder to a remote host over SSH.', answer: 'rsync -av ./ www@server:/srv/app/', topic: 'Automation' },
          { prompt: 'Create an xz-compressed archive of the deploy artifacts.', answer: 'tar -cJf deploy-artifacts.tar.xz dist', topic: 'Archives' },
        ],
      },
      {
        rank: 'Cloud Engineer',
        salary: '$120k',
        story: 'Instances, keys and config files at scale.',
        questions: [
          { prompt: 'Restrict your SSH key so ssh will accept it.', answer: 'chmod 600 key.pem', topic: 'Security' },
          { prompt: 'Query an API endpoint and show just the HTTP status.', answer: 'curl -o /dev/null -s -w "%{http_code}" https://api.example.com', topic: 'Network' },
          { prompt: 'Create a systemd unit directory for a custom service.', answer: 'mkdir -p /etc/systemd/system', topic: 'Services' },
          { prompt: 'Show the public IP of this host.', answer: 'curl -s ifconfig.me', topic: 'Network' },
        ],
      },
      {
        rank: 'Site Reliability Engineer',
        salary: '$150k',
        story: 'Reliability is your job: DNS, sockets, signals.',
        questions: [
          { prompt: 'Resolve the A record for example.com.', answer: 'dig +short example.com A', topic: 'Network' },
          { prompt: 'Show which process owns port 22.', answer: 'ss -tlnp | grep :22', topic: 'Network' },
          { prompt: 'Kill every process named "leak".', answer: 'pkill leak', topic: 'Processes' },
          { prompt: 'Watch the journal for a unit live.', answer: 'journalctl -u myapp -f', topic: 'Logs' },
          { prompt: 'Trace the network path to the database server.', answer: 'traceroute -n db.internal.example', topic: 'Network' },
          { prompt: 'Show every interface IP to catch a misconfigured NIC.', answer: 'ip addr show', topic: 'Network' },
          { prompt: 'Confirm port 443 is actually open with a firewall rule check.', answer: 'ufw status verbose', topic: 'Network' },
        ],
      },
    ],
  },
  'career-simulator': {
    title: 'ABC Bank — A Full Career',
    levels: [
      {
        rank: 'Day 1 — You join ABC Bank',
        salary: 'Onboarding',
        story: 'Your laptop is provisioned. Orient yourself on the jump box.',
        questions: [
          { prompt: 'Show which user you are logged in as.', answer: 'whoami', topic: 'Basics' },
          { prompt: 'Show your current directory.', answer: 'pwd', topic: 'Basics' },
        ],
      },
      {
        rank: 'Day 2 — Manager assigns tickets',
        salary: 'Ticket queue opens',
        story: 'First tickets: a web server that is down and a disk that is filling.',
        questions: [
          { prompt: 'Check the status of the nginx service.', answer: 'systemctl status nginx', topic: 'Services' },
          { prompt: 'Show disk usage by filesystem.', answer: 'df -h', topic: 'Disk' },
        ],
      },
      {
        rank: 'Day 3 — Users report problems',
        salary: 'Accounts + perms',
        story: 'HR asks for a new account; a team cannot run a script.',
        questions: [
          { prompt: 'Create the account "maya".', answer: 'useradd maya', topic: 'Users' },
          { prompt: 'Make deploy.sh executable for everyone.', answer: 'chmod +x deploy.sh', topic: 'Permissions' },
        ],
      },
      {
        rank: 'Day 4 — Security audit',
        salary: 'Audit findings',
        story: 'Auditors found open permissions and brute-force attempts.',
        questions: [
          { prompt: 'Count failed password attempts in auth.log.', answer: 'grep -c "Failed password" /var/log/auth.log', topic: 'Security' },
          { prompt: 'Lock down a private key file.', answer: 'chmod 600 key.pem', topic: 'Security' },
        ],
      },
      {
        rank: 'Day 5 — Server crash',
        salary: 'On-call rotation',
        story: 'The payments DB went down at 2am. You are on call.',
        questions: [
          { prompt: 'Show the last 50 error-level journal lines.', answer: 'journalctl -p err -n 50', topic: 'Logs' },
          { prompt: 'Restart the database service.', answer: 'systemctl restart postgresql', topic: 'Services' },
        ],
      },
      {
        rank: 'Day 6 — Storage full',
        salary: 'Capacity planning',
        story: 'The bank vault of logs filled the disk again.',
        questions: [
          { prompt: 'Find the biggest directories under /var.', answer: 'du -h --max-depth=1 /var | sort -rh | head', topic: 'Disk' },
          { prompt: 'Compress old logs into one archive.', answer: 'tar -czf /root/old-logs.tgz /var/log/app', topic: 'Archives' },
        ],
      },
      {
        rank: 'Day 7 — Production deployment',
        salary: 'Release engineer',
        story: 'You ship the new core-banking release.',
        questions: [
          { prompt: 'Package the app directory into release.tgz.', answer: 'tar -czf release.tgz /srv/app', topic: 'Archives' },
          { prompt: 'Enable and start the new service in one step.', answer: 'systemctl enable --now myapp', topic: 'Services' },
        ],
      },
      {
        rank: 'Day 8 — Promotion: you manage 500 servers',
        salary: 'Staff Engineer',
        story: 'One fleet, one SSH key. Check a remote host health.',
        questions: [
          { prompt: 'Connect to a remote host using an SSH key.', answer: 'ssh -i key.pem ubuntu@server', topic: 'Remote' },
          { prompt: 'Show disk space on the remote host.', answer: 'ssh -i key.pem ubuntu@server df -h', topic: 'Remote' },
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Virtual labs (simulated filesystem)
// ---------------------------------------------------------------------------

export const VIRTUAL_LABS = {
  'virtual-lab': {
    intro:
      'Explore the simulated filesystem. Commands supported: pwd, ls, ls -la, cd, cat, head, tail, wc, grep, find -name, clear, help. Goal: locate the flag.',
    fs: {
      '/': {
        type: 'dir',
        children: {
          home: {
            type: 'dir',
            children: {
              student: {
                type: 'dir',
                children: {
                  'notes.txt': { type: 'file', content: 'The flag is in a hidden file. Look with ls -la.' },
                  todo: { type: 'dir', children: { 'lab.txt': { type: 'file', content: 'finish the lab' } } },
                  '.secret': { type: 'file', content: 'FLAG{sim_fs_mastered}' },
                },
              },
            },
          },
          etc: {
            type: 'dir',
            children: {
              passwd: { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:Student:/home/student:/bin/bash' },
              hostname: { type: 'file', content: 'virtual-lab' },
            },
          },
          var: {
            type: 'dir',
            children: {
              log: { type: 'dir', children: { syslog: { type: 'file', content: 'boot ok\nagent started' } } },
              tmp: { type: 'dir', children: {} },
            },
          },
          opt: {
            type: 'dir',
            children: {
              app: { type: 'dir', children: { 'app.conf': { type: 'file', content: 'mode=production\nflag: keep searching deeper' } } },
            },
          },
          tmp: { type: 'dir', children: {} },
        },
      },
    },
    goals: [
      { text: 'Find and read the hidden file containing the flag.', check: (out) => String(out).includes('FLAG{') },
    ],
  },
  'escape-room': {
    intro:
      'You are locked in /home/admin. Complete each room by running the right command. Supported: pwd, ls, ls -la, cd, cat, find -name, clear, help.',
    fs: {
      '/': {
        type: 'dir',
        children: {
          home: {
            type: 'dir',
            children: {
              admin: {
                type: 'dir',
                children: {
                  '.key': { type: 'file', content: 'the first password is: OPEN-SESAME' },
                  vault: {
                    type: 'dir',
                    children: {
                      'door.txt': { type: 'file', content: 'Room 2 passed. Next: the vault key is guarded by a process. Find it with ps.' },
                      '.pass': { type: 'file', content: 'vault-key-2233' },
                    },
                  },
                },
              },
            },
          },
          var: {
            type: 'dir',
            children: {
              'process-list.txt': { type: 'file', content: 'PID 1337 is the guard process named guard.' },
            },
          },
          tmp: { type: 'dir', children: {} },
        },
      },
    },
    rooms: [
      { id: 1, title: 'The Locked Door', hint: 'List everything in /home/admin, including hidden files.', require: 'ls -la' },
      { id: 2, title: 'The Key', hint: 'Read the hidden .key file with cat.', require: 'cat .key' },
      { id: 3, title: 'Into the Vault', hint: 'Move into the vault directory, then list hidden files inside.', require: 'ls -la vault' },
      { id: 4, title: 'The Guard', hint: 'Find the guard process using ps.', require: 'ps aux' },
      { id: 5, title: 'The Final Password', hint: 'Read the hidden password inside the vault: cat vault/.pass', require: 'cat vault/.pass' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Daily challenge pool (deterministic pick by day-of-year)
// ---------------------------------------------------------------------------

export const DAILY_POOL = {
  command: [
    { prompt: 'Create a directory named "daily".', answer: 'mkdir daily', topic: 'Files' },
    { prompt: 'Show the current working directory.', answer: 'pwd', topic: 'Basics' },
    { prompt: 'List all files including hidden ones.', answer: 'ls -la', topic: 'Files' },
    { prompt: 'Make a file executable.', answer: 'chmod +x script.sh', topic: 'Permissions' },
    { prompt: 'Restart the nginx service.', answer: 'systemctl restart nginx', topic: 'Services' },
    { prompt: 'Show free disk space.', answer: 'df -h', topic: 'Disk' },
    { prompt: 'Create a new user "ops".', answer: 'useradd ops', topic: 'Users' },
    { prompt: 'Search for "error" in app.log.', answer: 'grep error app.log', topic: 'Text' },
    { prompt: 'Show the last 10 lines of error.log.', answer: 'tail -10 error.log', topic: 'Text' },
    { prompt: 'Compress src into src.tgz.', answer: 'tar -czf src.tgz src', topic: 'Archives' },
    { prompt: 'Find .log files larger than 10 MB.', answer: 'find . -name "*.log" -size +10M', topic: 'Search' },
    { prompt: 'List listening TCP ports.', answer: 'ss -tln', topic: 'Network' },
    { prompt: 'Kill process with PID 1234.', answer: 'kill 1234', topic: 'Processes' },
    { prompt: 'Set the group to devs on project.txt.', answer: 'chgrp devs project.txt', topic: 'Ownership' },
    { prompt: 'Show the hostname.', answer: 'hostname', topic: 'System' },
    { prompt: 'List the contents of backup.tar.gz without extracting.', answer: 'tar -tzf backup.tar.gz', topic: 'Archives' },
    { prompt: 'Show every IP address on every interface.', answer: 'ip addr show', topic: 'Network' },
    { prompt: 'Show the routing table and default gateway.', answer: 'ip route show', topic: 'Network' },
    { prompt: 'Test reachability of example.com with 3 packets.', answer: 'ping -c 3 example.com', topic: 'Network' },
  ],
  mcq: [
    { prompt: 'Which command shows free memory?', options: ['free -h', 'df -h', 'ls -h', 'du -h'], correctIndex: 0, topic: 'System' },
    { prompt: 'Which mode is rwxr-xr--?', options: ['754', '755', '744', '764'], correctIndex: 0, topic: 'Permissions' },
    { prompt: 'What does tail -f do?', options: ['Follows a file as it grows', 'Shows the last 5 files', 'Creates a file', 'Deletes a file'], correctIndex: 0, topic: 'Text' },
    { prompt: 'Which command moves a file?', options: ['mv', 'cp', 'touch', 'ln'], correctIndex: 0, topic: 'Files' },
    { prompt: 'The sticky bit is typically set on which directory?', options: ['/tmp', '/etc', '/var', '/root'], correctIndex: 0, topic: 'Permissions' },
    { prompt: 'Which command searches files for text?', options: ['grep', 'cat', 'ls', 'touch'], correctIndex: 0, topic: 'Text' },
    { prompt: 'Which shows listening ports?', options: ['ss -tln', 'ps aux', 'top', 'df -h'], correctIndex: 0, topic: 'Network' },
    { prompt: 'Which command creates an archive?', options: ['tar -czf', 'gzip -d', 'xz', 'zip -d'], correctIndex: 0, topic: 'Archives' },
    { prompt: 'Which signal does kill -9 send?', options: ['SIGKILL', 'SIGTERM', 'SIGINT', 'SIGHUP'], correctIndex: 0, topic: 'Processes' },
    { prompt: 'Which file lists user accounts?', options: ['/etc/passwd', '/etc/hosts', '/etc/fstab', '/proc/meminfo'], correctIndex: 0, topic: 'Users' },
    { prompt: 'Which flag makes tar compress with xz?', options: ['-J', '-z', '-j', '-c'], correctIndex: 0, topic: 'Archives' },
    { prompt: 'Which command shows what is inside backup.tar.gz WITHOUT extracting?', options: ['tar -tzf backup.tar.gz', 'tar -xzf backup.tar.gz', 'gzip -d backup.tar.gz', 'cat backup.tar.gz'], correctIndex: 0, topic: 'Archives' },
    { prompt: 'Which command traces the route packets take to a host?', options: ['traceroute example.com', 'ping -c 1 example.com', 'ss -tlnp', 'ip addr show'], correctIndex: 0, topic: 'Network' },
    { prompt: 'Which command resolves a DNS A record directly from a nameserver?', options: ['dig example.com A', 'cat /etc/hosts', 'grep example /etc/hosts', 'ping example.com'], correctIndex: 0, topic: 'Network' },
    { prompt: 'Which command shows the IP-to-MAC (ARP) mapping table?', options: ['ip neigh show', 'ip addr show', 'ip route show', 'cat /etc/resolv.conf'], correctIndex: 0, topic: 'Network' },
    { prompt: 'Which command shows which process owns a listening port?', options: ['ss -tlnp', 'df -h', 'ps aux | head', 'uptime'], correctIndex: 0, topic: 'Network' },
  ],
};

// ---------------------------------------------------------------------------
// Scenario generator fallback (used if Gemini is unavailable)
// ---------------------------------------------------------------------------

export const SCENARIO_FALLBACK = [
  { prompt: 'Finance cannot execute their report script report.sh. Fix the permissions without changing ownership.', answer: 'chmod +x report.sh', topic: 'Permissions', explanation: 'chmod +x adds execute without touching owner/group.' },
  { prompt: 'The marketing site is down (nginx). Restart the web service.', answer: 'systemctl restart nginx', topic: 'Services', explanation: 'systemctl restart brings the unit back up cleanly.' },
  { prompt: 'HR needs an account for intern "intern1" including a home directory.', answer: 'useradd -m intern1', topic: 'Users', explanation: '-m creates the home directory automatically.' },
  { prompt: 'Disk is at 90%. Find the biggest directories under /var.', answer: 'du -h --max-depth=1 /var | sort -rh | head -10', topic: 'Disk', explanation: 'du measures usage, sort -rh orders descending.' },
  { prompt: 'Backups stopped running. Show the crontab to inspect the schedule.', answer: 'crontab -l', topic: 'Scheduling', explanation: 'crontab -l prints the current cron entries.' },
  { prompt: 'A config was corrupted. Confirm /backups/etc.tar.gz contains /etc/passwd before restoring.', answer: 'tar -tzf /backups/etc.tar.gz | grep etc/passwd', topic: 'Archives', explanation: 'tar -tzf lists the archive; grep confirms the file is inside.' },
  { prompt: 'The app is unreachable on port 8080. Check whether anything is listening.', answer: 'ss -tlnp | grep :8080', topic: 'Network', explanation: 'ss -tlnp lists TCP listeners with PIDs; grep isolates port 8080.' },
  { prompt: 'DNS is failing for the internal name. Query the A record directly to bypass caches.', answer: 'dig app.internal.example A', topic: 'Network', explanation: 'dig talks to the resolver directly and prints the record it returns.' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export { shuffle };

