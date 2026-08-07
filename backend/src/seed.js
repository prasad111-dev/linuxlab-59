const Category = require('./models/Category');
const Task = require('./models/Task');
const { seedCatalog } = require('./services/achievementService');

const CATEGORIES = [
  { name: 'Linux Basics', icon: '🐧', color: '#22c55e', description: 'Core concepts every Linux admin needs.' },
  { name: 'Linux Commands', icon: '⌨️', color: '#0ea5e9', description: 'Essential command-line fluency.' },
  { name: 'File System', icon: '🗂️', color: '#f59e0b', description: 'Files, directories, mounts and layout.' },
  { name: 'Permissions', icon: '🔐', color: '#ef4444', description: 'Ownership, modes, ACLs and special bits.' },
  { name: 'User Management', icon: '👤', color: '#8b5cf6', description: 'Creating and managing user accounts.' },
  { name: 'Group Management', icon: '👥', color: '#ec4899', description: 'Groups and membership management.' },
  { name: 'Networking', icon: '🌐', color: '#14b8a6', description: 'Addressing, routing and connectivity.' },
  { name: 'SSH', icon: '🔑', color: '#f97316', description: 'Secure remote access and hardening.' },
  { name: 'Firewall', icon: '🧱', color: '#dc2626', description: 'UFW / iptables and service exposure.' },
  { name: 'Package Management', icon: '📦', color: '#84cc16', description: 'Installing and updating software.' },
  { name: 'Storage', icon: '💾', color: '#06b6d4', description: 'Disks, partitions and filesystems.' },
  { name: 'LVM', icon: '📐', color: '#a3e635', description: 'Logical volume management.' },
  { name: 'Cron Jobs', icon: '⏰', color: '#eab308', description: 'Automating tasks with cron.' },
  { name: 'System Monitoring', icon: '📊', color: '#3b82f6', description: 'Resource and performance monitoring.' },
  { name: 'Process Management', icon: '⚙️', color: '#64748b', description: 'Processes, signals and job control.' },
  { name: 'Apache', icon: '🅰️', color: '#d946ef', description: 'Apache web server administration.' },
  { name: 'Nginx', icon: '🟢', color: '#10b981', description: 'Nginx web server and reverse proxy.' },
  { name: 'DNS', icon: '🧭', color: '#7c3aed', description: 'Domain name resolution and services.' },
  { name: 'FTP', icon: '📤', color: '#f43f5e', description: 'File transfer protocol services.' },
  { name: 'NFS', icon: '🔗', color: '#0d9488', description: 'Network file sharing with NFS.' },
  { name: 'Samba', icon: '🖥️', color: '#4ade80', description: 'Windows-compatible file sharing.' },
  { name: 'Docker', icon: '🐳', color: '#0284c7', description: 'Containers and images.' },
  { name: 'Shell Scripting', icon: '🐚', color: '#facc15', description: 'Automation with bash scripts.' },
  { name: 'System Security', icon: '🛡️', color: '#b91c1c', description: 'Hardening and access control.' },
  { name: 'Log Analysis', icon: '📜', color: '#a16207', description: 'Reading and interpreting logs.' },
  { name: 'Troubleshooting', icon: '🔍', color: '#9333ea', description: 'Diagnosing real-world failures.' },
  { name: 'Production Linux', icon: '🏭', color: '#475569', description: 'Running reliable production servers.' },
  { name: 'DevOps', icon: '🚀', color: '#2563eb', description: 'Modern operations and tooling.' },
  { name: 'Interview Scenarios', icon: '🎯', color: '#0891b2', description: 'Real interview-style tasks.' },
];

const SEED_TASKS = [
  {
    title: 'Onboard a new developer',
    categorySlug: 'user-management',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    points: 100,
    scenario:
      'The dev team is growing fast. Rahul is joining tomorrow as a backend developer, and it is your job to set up his Linux account so he can start on day one. Do not create any users except the ones the requirements ask for.',
    objectives: [
      'Create the user account rahul',
      'Create the devteam group',
      'Add rahul to the devteam group',
      'Set the correct home directory permissions',
      'Ensure the login shell is /bin/bash',
    ],
    requirements: [
      'User rahul exists with /bin/bash as login shell',
      'Group devteam exists',
      'rahul is a member of devteam',
      '/home/rahul is owned by rahul:devteam',
      '/home/rahul has permissions 750',
    ],
    instructions: [
      'Create the devteam group first.',
      'Create rahul with a home directory and /bin/bash shell.',
      'Add rahul to the devteam group.',
      'Fix the owner and permissions of /home/rahul.',
      'Verify with: id rahul, groups rahul, ls -ld /home/rahul',
    ],
    expectedOutcome:
      'id rahul shows rahul in the devteam group, and /home/rahul is owned by rahul:devteam with mode 750.',
    learningOutcomes: [
      'Create users and groups with useradd/groupadd',
      'Manage group membership with usermod -aG',
      'Set ownership with chown and modes with chmod',
    ],
    hints: [
      'Start with groupadd, then useradd with the -m and -s flags.',
      'Membership is managed with usermod -aG devteam rahul.',
      'The final ls -ld /home/rahul should look like drwxr-x--- rahul devteam.',
    ],
    solution:
      'groupadd devteam\nuseradd -m -s /bin/bash rahul\nusermod -aG devteam rahul\nchown rahul:devteam /home/rahul\nchmod 750 /home/rahul',
    validationRules: [
      { type: 'user_exists', label: 'Create the user rahul', params: { username: 'rahul' } },
      { type: 'group_exists', label: 'Create the group devteam', params: { group: 'devteam' } },
      { type: 'command_contains', label: 'Add rahul to the devteam group', params: { command: 'groups rahul', needle: 'devteam' } },
      { type: 'file_permissions', label: 'Set /home/rahul permissions to 750 (drwxr-x---)', params: { path: '/home/rahul', expected: '750' } },
      { type: 'file_owner', label: 'Make /home/rahul owned by rahul:devteam', params: { path: '/home/rahul', expected: 'rahul:devteam' } },
      { type: 'command_contains', label: 'Set rahul login shell to /bin/bash', params: { command: 'getent passwd rahul', needle: '/bin/bash' } },
    ],
  },
  {
    title: 'Deploy a website with Nginx',
    categorySlug: 'nginx',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    points: 150,
    scenario:
      'Acme Corp wants their landing page live. You need to configure Nginx to serve a site from /var/www/acme and make it reachable on port 80. The marketing team already wrote the HTML.',
    objectives: [
      'Create /var/www/acme/index.html with the content "Welcome to Acme Corp"',
      'Create an Nginx server block for the site',
      'Enable the site and reload Nginx',
      'Verify the site is served on port 80',
    ],
    requirements: [
      'Nginx is installed',
      '/var/www/acme/index.html exists and contains "Welcome to Acme Corp"',
      '/etc/nginx/sites-available/acme exists',
      '/etc/nginx/sites-enabled/acme exists (enabled)',
      'Nginx service is active',
      'Port 80 is open and returns the site content',
    ],
    instructions: [
      'Create the document root and index.html with the exact content.',
      'Create /etc/nginx/sites-available/acme with a server block listening on port 80 pointing to your document root.',
      'Enable it with a symlink into sites-enabled and remove the default site if it conflicts.',
      'Validate the config with nginx -t, then reload.',
      'Test with: curl -s http://127.0.0.1/',
    ],
    expectedOutcome: 'curl -s http://127.0.0.1/ prints "Welcome to Acme Corp".',
    learningOutcomes: [
      'Configure Nginx server blocks',
      'Manage sites-available/sites-enabled',
      'Reload services safely with nginx -t',
    ],
    hints: [
      'The server block needs a listen 80; directive and a root pointing at /var/www/acme.',
      'The default site in sites-enabled may be holding port 80 — disable it if needed.',
      'After editing, run nginx -t before systemctl reload nginx.',
    ],
    solution:
      'mkdir -p /var/www/acme\necho "Welcome to Acme Corp" > /var/www/acme/index.html\n' +
      'cat > /etc/nginx/sites-available/acme <<EOF\nserver {\n    listen 80;\n    server_name _;\n    root /var/www/acme;\n    index index.html;\n}\nEOF\n' +
      'ln -s /etc/nginx/sites-available/acme /etc/nginx/sites-enabled/acme\n' +
      'rm -f /etc/nginx/sites-enabled/default\nnginx -t\nsystemctl reload nginx',
    validationRules: [
      { type: 'package_installed', label: 'Install the nginx web server', params: { package: 'nginx' } },
      { type: 'file_exists', label: 'Create the webpage file /var/www/acme/index.html', params: { path: '/var/www/acme/index.html' } },
      { type: 'file_contains', label: 'Put the text "Welcome to Acme Corp" inside /var/www/acme/index.html', params: { path: '/var/www/acme/index.html', needle: 'Welcome to Acme Corp' } },
      { type: 'file_exists', label: 'Create the site config /etc/nginx/sites-available/acme', params: { path: '/etc/nginx/sites-available/acme' } },
      { type: 'file_exists', label: 'Enable the site by linking it into /etc/nginx/sites-enabled/acme', params: { path: '/etc/nginx/sites-enabled/acme' } },
      { type: 'service_active', label: 'Make sure the nginx service is running', params: { service: 'nginx' } },
      { type: 'port_open', label: 'Open port 80 (server must accept connections)', params: { port: 80 } },
      { type: 'command_contains', label: 'Visiting http://127.0.0.1/ must show "Welcome to Acme Corp"', params: { command: 'curl -s --max-time 5 http://127.0.0.1/', needle: 'Welcome to Acme Corp' } },
    ],
  },
  {
    title: 'Schedule automated backups with cron',
    categorySlug: 'cron-jobs',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    points: 120,
    scenario:
      'Your company database lives in /var/lib/linuxlab and nobody backs it up. The CTO wants a nightly backup script and a cron job that runs it automatically at 02:30 every day.',
    objectives: [
      'Create /usr/local/bin/backup.sh that archives /var/lib/linuxlab into /backups with a tar file',
      'Make the script executable',
      'Ensure /backups exists',
      'Add a root cron job to run the script daily at 02:30',
    ],
    requirements: [
      '/usr/local/bin/backup.sh exists and is executable (755)',
      'The script uses tar to create a backup',
      '/backups directory exists',
      'crontab contains a line running the script at 02:30 daily',
    ],
    instructions: [
      'Write the script so it creates /backups if missing and tars /var/lib/linuxlab into /backups/backup-$(date +%F).tar.gz.',
      'chmod 755 the script.',
      'Edit the root crontab with crontab -e.',
      'Add: 30 2 * * * /usr/local/bin/backup.sh',
    ],
    expectedOutcome: 'crontab -l shows the 02:30 backup job and the script is executable.',
    learningOutcomes: [
      'Write robust shell scripts with variables',
      'Set permissions with chmod',
      'Schedule recurring jobs with cron',
    ],
    hints: [
      'The script should start with #!/bin/bash.',
      'The cron time syntax is minute hour day month weekday.',
      'Test the script manually once before adding it to cron.',
    ],
    solution:
      'mkdir -p /backups\n' +
      'cat > /usr/local/bin/backup.sh <<EOF\n#!/bin/bash\nmkdir -p /backups\ntar -czf /backups/backup-\$(date +%F).tar.gz /var/lib/linuxlab\nEOF\n' +
      'chmod 755 /usr/local/bin/backup.sh\n' +
      'crontab -e   # add: 30 2 * * * /usr/local/bin/backup.sh',
    validationRules: [
      { type: 'file_exists', label: 'Create the backup script /usr/local/bin/backup.sh', params: { path: '/usr/local/bin/backup.sh' } },
      { type: 'file_permissions', label: 'Make /usr/local/bin/backup.sh executable (permissions 755)', params: { path: '/usr/local/bin/backup.sh', expected: '755' } },
      { type: 'file_contains', label: 'The script must create a backup using tar', params: { path: '/usr/local/bin/backup.sh', needle: 'tar' } },
      { type: 'dir_exists', label: 'Create the /backups directory (where backups are saved)', params: { path: '/backups' } },
      { type: 'command_contains', label: 'Add a cron job that runs the backup script every day at 02:30', params: { command: 'crontab -l', needle: '30 2' } },
      { type: 'command_contains', label: 'The cron job must run /usr/local/bin/backup.sh', params: { command: 'crontab -l', needle: '/usr/local/bin/backup.sh' } },
    ],
  },
  {
    title: 'Harden SSH access',
    categorySlug: 'ssh',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    points: 150,
    scenario:
      'A security audit flagged that SSH allows root login on the production server. Create a dedicated admin user for remote access and harden sshd so root cannot log in over SSH. The service must keep running.',
    objectives: [
      'Disable root login over SSH',
      'Create admin user deploybot with sudo privileges',
      'Set up the deploybot home directory',
      'Restart SSH and verify it is listening on port 22',
    ],
    requirements: [
      '/etc/ssh/sshd_config contains "PermitRootLogin no"',
      'User deploybot exists and is in the sudo group',
      '/home/deploybot exists and is owned by deploybot',
      'SSH service is active',
      'Port 22 is open',
    ],
    instructions: [
      'Create deploybot with a home directory.',
      'Add deploybot to the sudo group.',
      'Edit /etc/ssh/sshd_config and set PermitRootLogin no.',
      'Restart the ssh service and confirm it stays up.',
      'Verify with: ss -ltn | grep :22',
    ],
    expectedOutcome: 'Root cannot SSH in, deploybot can, and sshd is listening on port 22.',
    learningOutcomes: [
      'Harden SSH configuration',
      'Create privileged users safely',
      'Restart critical services without downtime',
    ],
    hints: [
      'Sudo group membership is added with usermod -aG sudo deploybot.',
      'Find the PermitRootLogin line in /etc/ssh/sshd_config and uncomment + change it.',
      'Always restart ssh (not just reload) after changing config and test with a new connection.',
    ],
    solution:
      'useradd -m -s /bin/bash deploybot\nusermod -aG sudo deploybot\n' +
      "sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config\n" +
      'systemctl restart ssh\nsystemctl status ssh',
    validationRules: [
      { type: 'file_contains', label: 'Set "PermitRootLogin no" in /etc/ssh/sshd_config (block root over SSH)', params: { path: '/etc/ssh/sshd_config', needle: 'PermitRootLogin no' } },
      { type: 'user_exists', label: 'Create the user deploybot', params: { username: 'deploybot' } },
      { type: 'command_contains', label: 'Add deploybot to the sudo group (admin privileges)', params: { command: 'groups deploybot', needle: 'sudo' } },
      { type: 'dir_exists', label: 'Create the home directory /home/deploybot', params: { path: '/home/deploybot' } },
      { type: 'file_owner', label: 'Make /home/deploybot owned by deploybot', params: { path: '/home/deploybot', expected: 'deploybot:deploybot' } },
      { type: 'service_active', label: 'Make sure the SSH service is running', params: { service: 'ssh' } },
      { type: 'port_open', label: 'Open port 22 (SSH must accept connections)', params: { port: 22 } },
    ],
  },
  {
    title: 'Onboard a TCS employee',
    categorySlug: 'user-management',
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    points: 180,
    scenario:
      'TCS HR opened ticket INC-4821: Priya Sharma joins the Infrastructure & Cloud team as a Linux ' +
      'administrator tomorrow morning. Her workstation account must be provisioned from scratch — verified ' +
      'system state, team groups, a locked-down user (UID 2001) with a strong password policy, SSH key ' +
      'login, sudo access, a renamed corporate account (priya.sharma) with a migrated home directory, and a ' +
      'clean temporary-account lifecycle. Work through all 13 phases; the on-call engineer will audit the ' +
      'final state on day one.',
    objectives: [
      'Phase 1 - Verify who is logged in and inspect the system (whoami, who, w, id, $USER/$HOME, /etc/passwd, /etc/shadow, /etc/group)',
      'Phase 2 - Create the team groups tcs-employees, tcs-infra, and developers',
      'Phase 3 - Create user priya with UID 2001, a bash shell, and a home directory',
      'Phase 4 - Set a password, enforce aging (expire 90 days, warn 10 days early), and lock/unlock the account',
      'Phase 5 - Add priya to tcs-employees, tcs-infra, and sudo, then revoke developers access',
      'Phase 6 - Configure SSH key login for priya (.ssh 700, authorized_keys 600, owned by priya)',
      'Phase 7 - Secure the home directory (mode 700, owned priya:priya)',
      'Phase 8 - Review login history with last, lastb, lastlog, users, and loginctl',
      'Phase 9 - Rename the account to priya.sharma and migrate the home directory',
      'Phase 10 - Manage priya.sharma processes with ps and pkill',
      'Phase 11 - Verify account switching (su) and sudo access',
      'Phase 12 - Inspect the /etc user/group configuration files and login defaults',
      'Phase 13 - Provision a temporary tempdev account and remove it cleanly at the end',
    ],
    requirements: [
      'Groups tcs-employees, tcs-infra, and developers exist',
      'User priya.sharma exists with UID 2001, a /bin/bash login shell, and home directory /home/priya.sharma',
      'The old priya account no longer exists (rename completed)',
      'priya.sharma is a member of priya, sudo, tcs-employees, and tcs-infra, and was removed from developers',
      'Password is set, the account is unlocked, and aging is enforced (min 7, max 90, warn 10)',
      'priya.sharma can use sudo (sudo -l grants (ALL) ALL)',
      '/home/priya.sharma is mode 700 and owned priya.sharma:priya',
      '/home/priya.sharma/.ssh is mode 700 and /home/priya.sharma/.ssh/authorized_keys exists with mode 600, both owned priya.sharma:priya',
      'The temporary tempdev account was removed (must not exist at the end)',
    ],
    instructions: [
      'Phase 1 - Confirm you are root with whoami, who, w, id, echo $USER and echo $HOME, then review the account files: cat /etc/passwd, cut -d: -f1 /etc/passwd, cat /etc/shadow, cat /etc/group.',
      'Phase 2 - Create the groups with: groupadd tcs-employees, groupadd tcs-infra, groupadd developers.',
      'Phase 3 - Create priya with a home directory, UID 2001, and bash shell: useradd -m -u 2001 -s /bin/bash priya. Verify with id priya and ls -la /home/priya.',
      'Phase 4 - Set the password (interactive): passwd priya, then enforce aging with chage -M 90 priya, chage -m 7 priya, chage -W 10 priya, and review with chage -l priya. Demonstrate the lock/unlock lifecycle with passwd -l priya, passwd -S priya, passwd -u priya, then show account expiry handling with chage -E 0 priya and chage -E -1 priya.',
      'Phase 5 - Add membership in one shot: usermod -aG tcs-employees,tcs-infra,developers,sudo priya, then revoke developers access with gpasswd -d priya developers. Confirm with groups priya.',
      'Phase 6 - Set up SSH keys: mkdir -p /home/priya/.ssh, chmod 700 /home/priya/.ssh, write a test public key to /home/priya/.ssh/authorized_keys, chmod 600 it, and chown -R priya:priya /home/priya/.ssh.',
      'Phase 7 - Secure the home: chmod 700 /home/priya and chown -R priya:priya /home/priya, then confirm with ls -ld /home/priya.',
      'Phase 8 - Review login records with last, lastb, lastlog, users, and loginctl.',
      'Phase 9 - Rename the corporate account and migrate the home: usermod -l priya.sharma priya, then usermod -d /home/priya.sharma -m priya.sharma. Verify with id priya.sharma and ls -ld /home/priya.sharma.',
      'Phase 10 - List priya.sharma processes with ps -u priya.sharma and terminate them with pkill -u priya.sharma.',
      'Phase 11 - Verify switching and privileges: su priya.sharma (switch, then exit) and sudo -i or sudo -l -U priya.sharma.',
      'Phase 12 - Inspect the configuration: cat /etc/passwd, cat /etc/shadow, cat /etc/group, cat /etc/gshadow, cat /etc/login.defs, and ls -la /etc/skel.',
      'Phase 13 - Provision a temporary account: useradd tempdev, verify with id tempdev, then remove it with userdel -r tempdev and confirm it is gone (id tempdev must fail).',
    ],
    expectedOutcome:
      'id priya.sharma shows UID 2001 and membership in priya, sudo, tcs-employees, and tcs-infra. ' +
      'passwd -S priya.sharma reports an unlocked account (P) with aging 7 90 10 and chage -l shows the ' +
      '90-day policy. /home/priya.sharma and .ssh are mode 700/600 with priya.sharma:priya ownership, the ' +
      'old priya account and tempdev are gone, and sudo -l -U priya.sharma grants (ALL) ALL.',
    learningOutcomes: [
      'Create and harden enterprise user accounts (UID, shell, home)',
      'Enforce password aging and the account lock/unlock lifecycle',
      'Manage group membership, including sudo grants and revocation',
      'Configure SSH key-based authentication with correct ownership',
      'Rename accounts and migrate home directories with usermod',
      'Provision and tear down temporary accounts safely',
    ],
    hints: [
      'Confirm you are root first: whoami (you will be root in this lab).',
      'Create priya with: useradd -m -u 2001 -s /bin/bash priya — the -m flag creates /home/priya.',
      'passwd priya is interactive: type the password when prompted, then enforce aging with chage -M 90 -m 7 -W 10 priya.',
      'Membership in one shot: usermod -aG tcs-employees,tcs-infra,sudo priya, then gpasswd -d priya developers.',
      'SSH key flow: mkdir -p /home/priya/.ssh, chmod 700, write the key to authorized_keys, chmod 600, chown -R priya:priya.',
      'Rename: usermod -l priya.sharma priya, then usermod -d /home/priya.sharma -m priya.sharma.',
      'tempdev lifecycle: useradd tempdev, verify with id tempdev, then userdel -r tempdev.',
    ],
    solution:
      '# Phase 1 - verify the current user and system info\n' +
      'whoami\n' +
      'who\n' +
      'w\n' +
      'id\n' +
      'echo $USER\n' +
      'echo $HOME\n' +
      'cat /etc/passwd\n' +
      'cut -d: -f1 /etc/passwd\n' +
      'cat /etc/shadow\n' +
      'cat /etc/group\n' +
      '# Phase 2 - create the team groups\n' +
      'groupadd tcs-employees\n' +
      'groupadd tcs-infra\n' +
      'groupadd developers\n' +
      '# Phase 3 - create priya (UID 2001, bash, home dir)\n' +
      'useradd -m -u 2001 -s /bin/bash priya\n' +
      'id priya\n' +
      'ls -la /home/priya\n' +
      '# Phase 4 - password, aging policy, lock/unlock, expiry demo\n' +
      'passwd priya\n' +
      'chage -M 90 priya\n' +
      'chage -m 7 priya\n' +
      'chage -W 10 priya\n' +
      'chage -l priya\n' +
      'passwd -l priya\n' +
      'passwd -S priya\n' +
      'passwd -u priya\n' +
      'chage -E 0 priya\n' +
      'chage -E -1 priya\n' +
      '# Phase 5 - membership incl. sudo, then revoke developers\n' +
      'usermod -aG tcs-employees,tcs-infra,developers,sudo priya\n' +
      'gpasswd -d priya developers\n' +
      'groups priya\n' +
      '# Phase 6 - SSH key authentication\n' +
      'mkdir -p /home/priya/.ssh\n' +
      'chmod 700 /home/priya/.ssh\n' +
      'echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQAB... priya-sharma@tcs" > /home/priya/.ssh/authorized_keys\n' +
      'chmod 600 /home/priya/.ssh/authorized_keys\n' +
      'chown -R priya:priya /home/priya/.ssh\n' +
      '# Phase 7 - secure the home directory\n' +
      'chmod 700 /home/priya\n' +
      'chown -R priya:priya /home/priya\n' +
      'ls -ld /home/priya\n' +
      '# Phase 8 - review login history\n' +
      'last\n' +
      'lastb\n' +
      'lastlog\n' +
      'users\n' +
      'loginctl\n' +
      '# Phase 9 - rename to priya.sharma and migrate the home\n' +
      'usermod -l priya.sharma priya\n' +
      'usermod -d /home/priya.sharma -m priya.sharma\n' +
      'id priya.sharma\n' +
      'ls -ld /home/priya.sharma\n' +
      '# Phase 10 - manage processes\n' +
      'ps -u priya.sharma\n' +
      'pkill -u priya.sharma\n' +
      '# Phase 11 - verify su and sudo\n' +
      'su priya.sharma\n' +
      'sudo -i\n' +
      '# Phase 12 - inspect /etc user and group configuration\n' +
      'cat /etc/passwd\n' +
      'cat /etc/shadow\n' +
      'cat /etc/group\n' +
      'cat /etc/gshadow\n' +
      'cat /etc/login.defs\n' +
      'ls -la /etc/skel\n' +
      '# Phase 13 - tempdev user lifecycle (create then remove)\n' +
      'useradd tempdev\n' +
      'id tempdev\n' +
      'userdel -r tempdev\n' +
      'id tempdev',
    setupCommands: [],
    validationRules: [
      { type: 'group_exists', label: 'Create the group tcs-employees', params: { group: 'tcs-employees' } },
      { type: 'group_exists', label: 'Create the group tcs-infra', params: { group: 'tcs-infra' } },
      { type: 'group_exists', label: 'Create the group developers', params: { group: 'developers' } },
      { type: 'user_exists', label: 'Rename priya to priya.sharma (account exists)', params: { username: 'priya.sharma' } },
      { type: 'user_absent', label: 'Rename priya to priya.sharma (old priya account is gone)', params: { username: 'priya' } },
      { type: 'user_absent', label: 'Remove the temporary tempdev account at the end', params: { username: 'tempdev' } },
      { type: 'command_contains', label: 'Create priya with UID 2001', params: { command: 'getent passwd priya.sharma', needle: '2001' } },
      { type: 'command_contains', label: 'Set priya.sharma login shell to /bin/bash', params: { command: 'getent passwd priya.sharma', needle: '/bin/bash' } },
      { type: 'command_contains', label: 'Migrate the home directory to /home/priya.sharma', params: { command: 'getent passwd priya.sharma', needle: '/home/priya.sharma' } },
      { type: 'command_contains', label: 'Set a password and leave the account unlocked', params: { command: 'passwd -S priya.sharma', needle: ' P ' } },
      { type: 'command_contains', label: 'Enforce password aging (min 7, max 90, warn 10)', params: { command: 'passwd -S priya.sharma', needle: '7 90 10' } },
      { type: 'command_contains', label: 'Add priya.sharma to the tcs-employees group', params: { command: 'groups priya.sharma', needle: 'tcs-employees' } },
      { type: 'command_contains', label: 'Add priya.sharma to the tcs-infra group', params: { command: 'groups priya.sharma', needle: 'tcs-infra' } },
      { type: 'command_contains', label: 'Add priya.sharma to the sudo group', params: { command: 'groups priya.sharma', needle: 'sudo' } },
      { type: 'command_contains', label: 'Grant priya.sharma sudo privileges (sudo -l shows (ALL) ALL)', params: { command: 'sudo -l -U priya.sharma', needle: 'ALL) ALL' } },
      { type: 'dir_exists', label: 'Create the /home/priya.sharma home directory', params: { path: '/home/priya.sharma' } },
      { type: 'dir_exists', label: 'Create the /home/priya.sharma/.ssh directory', params: { path: '/home/priya.sharma/.ssh' } },
      { type: 'file_exists', label: 'Create /home/priya.sharma/.ssh/authorized_keys', params: { path: '/home/priya.sharma/.ssh/authorized_keys' } },
      { type: 'file_permissions', label: 'Set /home/priya.sharma/.ssh/authorized_keys permissions to 600', params: { path: '/home/priya.sharma/.ssh/authorized_keys', expected: '600' } },
      { type: 'file_permissions', label: 'Set /home/priya.sharma/.ssh permissions to 700', params: { path: '/home/priya.sharma/.ssh', expected: '700' } },
      { type: 'file_permissions', label: 'Set /home/priya.sharma permissions to 700', params: { path: '/home/priya.sharma', expected: '700' } },
      { type: 'file_owner', label: 'Own /home/priya.sharma as priya.sharma:priya', params: { path: '/home/priya.sharma', expected: 'priya.sharma:priya' } },
      { type: 'file_owner', label: 'Own /home/priya.sharma/.ssh as priya.sharma:priya', params: { path: '/home/priya.sharma/.ssh', expected: 'priya.sharma:priya' } },
      { type: 'file_owner', label: 'Own /home/priya.sharma/.ssh/authorized_keys as priya.sharma:priya', params: { path: '/home/priya.sharma/.ssh/authorized_keys', expected: 'priya.sharma:priya' } },
    ],
  },
  {
    title: 'Protect a shared directory with the sticky bit',
    categorySlug: 'permissions',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    points: 150,
    scenario:
      'The team shares one directory, /shared, where everyone uploads their deliverables. ' +
      'It was opened up with 777 permissions so anyone could write — and last week somebody accidentally ' +
      'deleted a teammate\'s file. Set up the shared directory correctly with the sticky bit so users can ' +
      'add and edit their own files, but nobody can delete a file they do not own.',
    objectives: [
      'Create users ankit, ram, and sham',
      'Create the shared directory /shared with full access (777)',
      'Have each user create their own file in /shared',
      'Enable the sticky bit on /shared',
      'Verify the sticky bit appears as drwxrwxrwt',
    ],
    requirements: [
      'Users ankit, ram, and sham exist',
      '/shared exists',
      'Sticky bit is enabled on /shared (mode 1777, shown as drwxrwxrwt)',
      '/shared/ankit.txt exists and is owned by ankit',
      '/shared/ram.txt exists and is owned by ram',
      '/shared/sham.txt exists and is owned by sham',
    ],
    instructions: [
      'Create three separate user accounts — one for each teammate: ankit, ram, and sham.',
      'Create a directory at the filesystem root that the whole team will share.',
      'Open the shared directory so every user can read, write and enter it.',
      'Switch to each user in turn and create a personal file inside the shared directory, named after that user.',
      'Before securing it, try deleting another user\'s file — with world-writable permissions it succeeds.',
      'Enable the special bit on the shared directory that stops users from deleting files they do not own.',
      'List the directory with full details and confirm the mode shows the special bit (drwxrwxrwt).',
      'Try deleting another user\'s file again — it must now be rejected, while deleting your own file still works.',
    ],
    expectedOutcome:
      'ls -ld /shared shows drwxrwxrwt, each user owns their own file, and a user can no longer delete another user\'s file.',
    learningOutcomes: [
      'Understand why a plain 777 directory is unsafe for sharing',
      'Set and verify the sticky bit and read it in the mode string',
      'Explain why each file must be created by the user who owns it',
    ],
    hints: [
      'The special permission you need is the sticky bit — it is enabled with the mode prefix 1.',
      'After enabling it, the mode string shows a lowercase t in the others position (drwxrwxrwt).',
      'An uppercase T (drwxrwxrwT) means the sticky bit is set but the execute bit is missing — not what you want.',
      'Switch between users with the login command so each file is created by its own owner.',
      'Each file must be created by the user who should own it — ownership is what the sticky bit enforces.',
    ],
    solution:
      'useradd ankit\nuseradd ram\nuseradd sham\npasswd ankit\npasswd ram\npasswd sham\n' +
      'mkdir /shared\nchmod 777 /shared\n' +
      'su - ankit\ntouch /shared/ankit.txt\nexit\n' +
      'su - ram\ntouch /shared/ram.txt\nexit\n' +
      'su - sham\ntouch /shared/sham.txt\nexit\n' +
      'chmod 1777 /shared\nls -ld /shared',
    validationRules: [
      { type: 'user_exists', label: 'Create the user ankit', params: { username: 'ankit' } },
      { type: 'user_exists', label: 'Create the user ram', params: { username: 'ram' } },
      { type: 'user_exists', label: 'Create the user sham', params: { username: 'sham' } },
      { type: 'dir_exists', label: 'Create the shared /shared directory', params: { path: '/shared' } },
      { type: 'file_permissions', label: 'Enable the sticky bit on /shared (permissions 1777)', params: { path: '/shared', expected: '1777' } },
      { type: 'command_contains', label: 'Listing /shared must show drwxrwxrwt (sticky bit is on)', params: { command: 'ls -ld /shared', needle: 'drwxrwxrwt' } },
      { type: 'file_exists', label: 'Create /shared/ankit.txt (must be owned by ankit)', params: { path: '/shared/ankit.txt' } },
      { type: 'file_owner', label: 'Make /shared/ankit.txt owned by ankit', params: { path: '/shared/ankit.txt', expected: 'ankit:ankit' } },
      { type: 'file_exists', label: 'Create /shared/ram.txt (must be owned by ram)', params: { path: '/shared/ram.txt' } },
      { type: 'file_owner', label: 'Make /shared/ram.txt owned by ram', params: { path: '/shared/ram.txt', expected: 'ram:ram' } },
      { type: 'file_exists', label: 'Create /shared/sham.txt (must be owned by sham)', params: { path: '/shared/sham.txt' } },
      { type: 'file_owner', label: 'Make /shared/sham.txt owned by sham', params: { path: '/shared/sham.txt', expected: 'sham:sham' } },
    ],
    sections: [
      {
        title: 'Create the users and the shared directory',
        instructions: [
          'Create three user accounts — one for each teammate (ankit, ram, sham).',
          'Create a directory at the filesystem root for the team to share.',
          'Open it up so every user can read, write and enter it.',
          'Confirm all three accounts exist and the directory is ready before moving on.',
        ],
        checks: [
          { type: 'user_exists', label: 'Create the user ankit', params: { username: 'ankit' } },
          { type: 'user_exists', label: 'Create the user ram', params: { username: 'ram' } },
          { type: 'user_exists', label: 'Create the user sham', params: { username: 'sham' } },
          { type: 'dir_exists', label: 'Create the shared /shared directory', params: { path: '/shared' } },
        ],
      },
      {
        title: 'Enable the sticky bit and verify it protects files',
        instructions: [
          'Switch to each user in turn and create a personal file inside the shared directory, named after that user.',
          'Enable the special bit that prevents users from deleting files they do not own.',
          'List the directory with full details and confirm the mode now shows the special bit (drwxrwxrwt).',
          'Try deleting another user\'s file — it must be rejected, while deleting your own file still works.',
        ],
        checks: [
          { type: 'file_permissions', label: 'Enable the sticky bit on /shared (permissions 1777)', params: { path: '/shared', expected: '1777' } },
          { type: 'command_contains', label: 'Listing /shared must show drwxrwxrwt (sticky bit is on)', params: { command: 'ls -ld /shared', needle: 'drwxrwxrwt' } },
          { type: 'file_exists', label: 'Create /shared/ankit.txt (must be owned by ankit)', params: { path: '/shared/ankit.txt' } },
          { type: 'file_owner', label: 'Make /shared/ankit.txt owned by ankit', params: { path: '/shared/ankit.txt', expected: 'ankit:ankit' } },
          { type: 'file_exists', label: 'Create /shared/ram.txt (must be owned by ram)', params: { path: '/shared/ram.txt' } },
          { type: 'file_owner', label: 'Make /shared/ram.txt owned by ram', params: { path: '/shared/ram.txt', expected: 'ram:ram' } },
          { type: 'file_exists', label: 'Create /shared/sham.txt (must be owned by sham)', params: { path: '/shared/sham.txt' } },
          { type: 'file_owner', label: 'Make /shared/sham.txt owned by sham', params: { path: '/shared/sham.txt', expected: 'sham:sham' } },
        ],
      },
    ],
  },
  {
    title: 'Linux Permission Management - Enterprise Production Scenario',
    categorySlug: 'permissions',
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    points: 250,
    scenario:
      'ABC FinTech runs its core banking application from /opt/banking on a shared production host. ' +
      'A rushed deployment left nearly every file and directory wide open (777), and the security audit ' +
      'flagged it as a critical risk. You must restore the correct ownership and permissions so the ' +
      'application works for the team while sensitive files stay locked down. Work only inside /opt/banking.',
    objectives: [
      'Audit /opt/banking and identify every insecure file and directory',
      'Lock down /opt/banking itself to 755',
      'Restrict the sensitive config.conf to 640',
      'Make the application scripts executable (app.sh, deploy.sh, backup.sh)',
      'Keep the user data file users.csv at 644',
      'Make reports/ and logs/ group-writable (775)',
      'Set the SGID bit on scripts/ so new files inherit the group (2775)',
      'Ensure shared/ is group-writable at 775',
      'Protect uploads/ with the sticky bit (1777)',
      'Verify every mode with stat and ls -ld',
    ],
    requirements: [
      '/opt/banking is mode 755 owned by root:root',
      '/opt/banking/config.conf is mode 640',
      '/opt/banking/app.sh is mode 755',
      '/opt/banking/deploy.sh is mode 755',
      '/opt/banking/backup.sh is mode 755',
      '/opt/banking/users.csv is mode 644',
      '/opt/banking/reports is mode 775',
      '/opt/banking/logs is mode 775',
      '/opt/banking/scripts is mode 2775 (SGID, drwxrwsr-x)',
      '/opt/banking/shared is mode 775',
      '/opt/banking/uploads is mode 1777 (sticky, drwxrwxrwt)',
    ],
    instructions: [
      'Start by auditing the tree — list the directory with full details and inspect the numeric mode of every file and subdirectory.',
      'Lock down the parent directory so only the owner can modify it while everyone can still read and traverse it (755).',
      'The configuration file holds credentials — restrict it so only the owner can write and the group can read (640).',
      'Make the application and backup scripts executable with no write access for group or others; the deployment script should already be correct (755).',
      'The user-data file must be writable only by the owner and readable by owner and group (644).',
      'Make the collaboration directories writable by the owning group — owner and group full access, others read and execute only (775).',
      'Apply the special group bit to the scripts directory so any new file created inside it inherits the owning group (2775).',
      'Apply the sticky bit to the uploads directory so users cannot delete files they do not own (1777).',
      'Verify the final state of every file and directory using the same inspection tools you used in the audit.',
    ],
    expectedOutcome:
      'stat shows /opt/banking/config.conf as -rw-r-----, app.sh/deploy.sh/backup.sh as executable, ' +
      'scripts/ as drwxrwsr-x (SGID), uploads/ as drwxrwxrwt (sticky), and every directory without ' +
      'unnecessary world access.',
    learningOutcomes: [
      'Audit filesystem permissions with listing and inspection tools',
      'Set standard modes and minimum privilege for production files',
      'Apply and verify the SGID and sticky special bits',
      'Reason about which files need group access versus strict owner-only access',
    ],
    hints: [
      'Start by listing every mode in the tree and flagging anything world-writable (777) — those are the offenders.',
      'Work from the outside in: fix the parent directory first, then each file and directory below it.',
      'The SGID bit is the letter s in the group position of the mode string (e.g. drwxrwsr-x).',
      'The sticky bit is the letter t in the others position (e.g. drwxrwxrwt).',
      'Use an inspection tool that prints both the numeric and the symbolic mode so you can confirm each special bit.',
    ],
    solution:
      'find /opt/banking -maxdepth 1 -printf "%m %u:%g %p\\n"\n' +
      'chmod 755 /opt/banking\n' +
      'chmod 640 /opt/banking/config.conf\n' +
      'chmod 755 /opt/banking/app.sh\n' +
      'chmod 755 /opt/banking/deploy.sh\n' +
      'chmod 755 /opt/banking/backup.sh\n' +
      'chmod 644 /opt/banking/users.csv\n' +
      'chmod 775 /opt/banking/reports\n' +
      'chmod 775 /opt/banking/logs\n' +
      'chmod 2775 /opt/banking/scripts\n' +
      'chmod 775 /opt/banking/shared\n' +
      'chmod 1777 /opt/banking/uploads\n' +
      'stat -c "%A %a %U:%G %n" /opt/banking/*',
    setupCommands: [
      'mkdir -p /opt/banking/reports /opt/banking/logs /opt/banking/scripts /opt/banking/shared /opt/banking/uploads',
      'touch /opt/banking/app.sh /opt/banking/deploy.sh /opt/banking/backup.sh /opt/banking/config.conf /opt/banking/users.csv',
      'chmod 777 /opt/banking',
      'chmod 777 /opt/banking/config.conf',
      'chmod 644 /opt/banking/app.sh',
      'chmod 755 /opt/banking/deploy.sh',
      'chmod 777 /opt/banking/backup.sh',
      'chmod 644 /opt/banking/users.csv',
      'chmod 777 /opt/banking/reports',
      'chmod 777 /opt/banking/logs',
      'chmod 755 /opt/banking/scripts',
      'chmod 777 /opt/banking/shared',
      'chmod 777 /opt/banking/uploads',
      'chown -R root:root /opt/banking',
    ],
    validationRules: [
      { type: 'file_permissions', label: 'Set /opt/banking permissions to 755', params: { path: '/opt/banking', expected: '755' } },
      { type: 'file_permissions', label: 'Set /opt/banking/config.conf permissions to 640 (owner write, group read)', params: { path: '/opt/banking/config.conf', expected: '640' } },
      { type: 'file_permissions', label: 'Make /opt/banking/app.sh executable (permissions 755)', params: { path: '/opt/banking/app.sh', expected: '755' } },
      { type: 'file_permissions', label: 'Make /opt/banking/deploy.sh executable (permissions 755)', params: { path: '/opt/banking/deploy.sh', expected: '755' } },
      { type: 'file_permissions', label: 'Remove group/other write access from /opt/banking/backup.sh (set 755)', params: { path: '/opt/banking/backup.sh', expected: '755' } },
      { type: 'file_permissions', label: 'Keep /opt/banking/users.csv at permissions 644', params: { path: '/opt/banking/users.csv', expected: '644' } },
      { type: 'file_permissions', label: 'Make /opt/banking/reports group-writable (permissions 775)', params: { path: '/opt/banking/reports', expected: '775' } },
      { type: 'file_permissions', label: 'Make /opt/banking/logs group-writable (permissions 775)', params: { path: '/opt/banking/logs', expected: '775' } },
      { type: 'file_permissions', label: 'Enable the SGID bit on /opt/banking/scripts (permissions 2775)', params: { path: '/opt/banking/scripts', expected: '2775' } },
      { type: 'command_contains', label: 'Listing /opt/banking/scripts must show drwxrwsr-x (SGID is on)', params: { command: 'ls -ld /opt/banking/scripts', needle: 'drwxrwsr-x' } },
      { type: 'file_permissions', label: 'Set /opt/banking/shared permissions to 775', params: { path: '/opt/banking/shared', expected: '775' } },
      { type: 'file_permissions', label: 'Enable the sticky bit on /opt/banking/uploads (permissions 1777)', params: { path: '/opt/banking/uploads', expected: '1777' } },
      { type: 'command_contains', label: 'Listing /opt/banking/uploads must show drwxrwxrwt (sticky bit is on)', params: { command: 'ls -ld /opt/banking/uploads', needle: 'drwxrwxrwt' } },
    ],
    sections: [
      {
        title: 'Lock down the application files',
        instructions: [
          'Audit the tree — list the directory with full details and inspect the numeric mode of every file and subdirectory.',
          'Lock down the parent directory so only the owner can modify it while everyone can still read and traverse it.',
          'The configuration file holds credentials — restrict it so only the owner can write and the group can read.',
          'Make the application and backup scripts executable, with no write access for group or others; the deployment script should already be correct.',
          'The user-data file must be writable only by the owner and readable by owner and group.',
        ],
        checks: [
          { type: 'file_permissions', label: 'Set /opt/banking permissions to 755', params: { path: '/opt/banking', expected: '755' } },
          { type: 'file_permissions', label: 'Set /opt/banking/config.conf permissions to 640 (owner write, group read)', params: { path: '/opt/banking/config.conf', expected: '640' } },
          { type: 'file_permissions', label: 'Make /opt/banking/app.sh executable (permissions 755)', params: { path: '/opt/banking/app.sh', expected: '755' } },
          { type: 'file_permissions', label: 'Make /opt/banking/deploy.sh executable (permissions 755)', params: { path: '/opt/banking/deploy.sh', expected: '755' } },
          { type: 'file_permissions', label: 'Remove group/other write access from /opt/banking/backup.sh (set 755)', params: { path: '/opt/banking/backup.sh', expected: '755' } },
          { type: 'file_permissions', label: 'Keep /opt/banking/users.csv at permissions 644', params: { path: '/opt/banking/users.csv', expected: '644' } },
        ],
      },
      {
        title: 'Fix the shared directories with special bits',
        instructions: [
          'Make the collaboration directories writable by the owning group — owner and group full access, others read and execute only.',
          'Apply the special group bit to the scripts directory so any new file created inside it inherits the owning group.',
          'Apply the sticky bit to the uploads directory so users cannot delete files they do not own.',
          'Verify the final state of every file and directory using the same inspection tools you used in the audit.',
        ],
        checks: [
          { type: 'file_permissions', label: 'Make /opt/banking/reports group-writable (permissions 775)', params: { path: '/opt/banking/reports', expected: '775' } },
          { type: 'file_permissions', label: 'Make /opt/banking/logs group-writable (permissions 775)', params: { path: '/opt/banking/logs', expected: '775' } },
          { type: 'file_permissions', label: 'Enable the SGID bit on /opt/banking/scripts (permissions 2775)', params: { path: '/opt/banking/scripts', expected: '2775' } },
          { type: 'command_contains', label: 'Listing /opt/banking/scripts must show drwxrwsr-x (SGID is on)', params: { command: 'ls -ld /opt/banking/scripts', needle: 'drwxrwsr-x' } },
          { type: 'file_permissions', label: 'Set /opt/banking/shared permissions to 775', params: { path: '/opt/banking/shared', expected: '775' } },
          { type: 'file_permissions', label: 'Enable the sticky bit on /opt/banking/uploads (permissions 1777)', params: { path: '/opt/banking/uploads', expected: '1777' } },
          { type: 'command_contains', label: 'Listing /opt/banking/uploads must show drwxrwxrwt (sticky bit is on)', params: { command: 'ls -ld /opt/banking/uploads', needle: 'drwxrwxrwt' } },
        ],
      },
    ],
  },
  {
    title: 'Fix the app links — hard links vs symbolic links',
    categorySlug: 'file-system',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    points: 180,
    scenario:
      'The web app at /srv/webapp stopped working after a cleanup deleted its links. ' +
      'The service reads its settings from /srv/webapp/config.yml, but the ops team keeps the master copy as ' +
      '/srv/webapp/settings.yml — the previous admin linked them with a HARD LINK so both names are the same file ' +
      '(one copy on disk; updating either name updates both). The website also lost its assets: /srv/webapp/www/assets ' +
      'used to point at the shared asset store /srv/webapp/shared-assets through a SYMBOLIC LINK. ' +
      'Recreate both links exactly the way they were set up, then prove you understand the difference between the two kinds of links.',
    objectives: [
      'Understand why the config used a hard link instead of a copy or a symlink',
      'Recreate the hard link /srv/webapp/config.yml → /srv/webapp/settings.yml (same file, same inode)',
      'Recreate the symbolic link /srv/webapp/www/assets → /srv/webapp/shared-assets',
      'Verify the hard link shares one inode and has a link count of 2',
      'Verify the symbolic link resolves to the shared assets folder',
    ],
    requirements: [
      '/srv/webapp/config.yml exists and is a regular file (a hard link, not a symlink)',
      '/srv/webapp/config.yml and /srv/webapp/settings.yml are the same file (same inode)',
      '/srv/webapp/config.yml has a link count of 2',
      '/srv/webapp/config.yml exposes the same settings content as /srv/webapp/settings.yml',
      '/srv/webapp/www/assets is a symbolic link',
      '/srv/webapp/www/assets resolves to the shared-assets directory (logo.png is reachable through it)',
    ],
    instructions: [
      'Start by inspecting the current state: ls -li /srv/webapp and ls -ld /srv/webapp/www /srv/webapp/shared-assets.',
      'Recreate the config hard link so the service can read its settings again — a new name for the existing master file on the same filesystem.',
      'Check the inode numbers of config.yml and settings.yml — they must match, and the link count of config.yml must be 2.',
      'Recreate the assets symbolic link so the website can load images through /srv/webapp/www/assets.',
      'Verify the symlink is a link (type l in ls -l) and that it resolves to the shared folder (read a file through the link).',
      'Learning check: cat the config through the new name — you should see the same content as settings.yml.',
    ],
    expectedOutcome:
      'stat -c "%i" /srv/webapp/config.yml matches settings.yml and the link count is 2; ls -l shows www/assets as a symlink; ' +
      'a file inside shared-assets is reachable through www/assets.',
    learningOutcomes: [
      'Create hard links with ln and read their inode and link count with ls -li and stat',
      'Create symbolic links with ln -s and distinguish them from hard links with ls -l and file',
      'Choose the right link: hard links are one file with many names (same filesystem only), symbolic links are separate pathnames that can target directories and cross filesystems',
    ],
    hints: [
      'Hard link: ln /srv/webapp/settings.yml /srv/webapp/config.yml — both names share one inode; stat -c "%h" shows the link count (2).',
      'A hard link is NOT a symbolic link: if config.yml shows up as type l (symlink), you used the wrong command (ln -s).',
      'Symbolic link: create it inside the web root so it resolves to the shared folder — e.g. ln -s ../shared-assets /srv/webapp/www/assets (an absolute path also works).',
      'ls -li prints inode numbers; ls -l shows a symlink with a leading l and an arrow to its target.',
      'test -d /srv/webapp/www/assets and cat /srv/webapp/www/assets/logo.png prove the symlink resolves correctly.',
    ],
    solution:
      'ls -li /srv/webapp\n' +
      'ln /srv/webapp/settings.yml /srv/webapp/config.yml\n' +
      'stat -c "%i %h" /srv/webapp/config.yml\n' +
      'ln -s ../shared-assets /srv/webapp/www/assets\n' +
      'ls -l /srv/webapp/www\n' +
      'file /srv/webapp/www/assets\n' +
      'cat /srv/webapp/www/assets/logo.png',
    setupCommands: [
      'mkdir -p /srv/webapp/www /srv/webapp/shared-assets',
      'printf "app_port: 8080\\nmode: production\\n" > /srv/webapp/settings.yml',
      'printf "GLBX-LOGO-DATA\\n" > /srv/webapp/shared-assets/logo.png',
      'printf "GLBX-ICONS\\n" > /srv/webapp/shared-assets/icons.css',
      'chown -R root:root /srv/webapp',
    ],
    validationRules: [
      { type: 'file_exists', label: 'Create /srv/webapp/config.yml as a hard link to /srv/webapp/settings.yml', params: { path: '/srv/webapp/config.yml' } },
      { type: 'file_type', label: '/srv/webapp/config.yml must be a real file made with a hard link (not a symbolic link)', params: { path: '/srv/webapp/config.yml', expected: 'regular file' } },
      { type: 'hardlink_exists', label: '/srv/webapp/config.yml and /srv/webapp/settings.yml must be the same file (one copy shared by both names)', params: { a: '/srv/webapp/config.yml', b: '/srv/webapp/settings.yml' } },
      { type: 'file_linkcount', label: '/srv/webapp/config.yml must have a link count of 2 (two names pointing to the one file)', params: { path: '/srv/webapp/config.yml', expected: '2' } },
      { type: 'file_contains', label: '/srv/webapp/config.yml must show the same content as /srv/webapp/settings.yml', params: { path: '/srv/webapp/config.yml', needle: 'app_port: 8080' } },
      { type: 'symlink_exists', label: 'Make /srv/webapp/www/assets a symbolic link', params: { path: '/srv/webapp/www/assets' } },
      { type: 'dir_exists', label: 'The /srv/webapp/www/assets link must open the /srv/webapp/shared-assets folder', params: { path: '/srv/webapp/www/assets' } },
      { type: 'file_exists', label: 'logo.png must be reachable through /srv/webapp/www/assets/', params: { path: '/srv/webapp/www/assets/logo.png' } },
      { type: 'file_contains', label: 'Reading logo.png through /srv/webapp/www/assets/ must show its content', params: { path: '/srv/webapp/www/assets/logo.png', needle: 'GLBX-LOGO-DATA' } },
    ],
    sections: [
      {
        title: 'Recreate the config hard link',
        instructions: [
          'Inspect the current state: list /srv/webapp with inode numbers (ls -li) and confirm settings.yml is still there.',
          'Create config.yml as a HARD LINK to the master copy settings.yml — both names must share the same inode.',
          'Verify with stat: the inode of both names matches and the link count of config.yml is 2.',
          'Confirm config.yml is a regular file, not a symbolic link.',
        ],
        checks: [
          { type: 'file_exists', label: 'Create /srv/webapp/config.yml as a hard link to /srv/webapp/settings.yml', params: { path: '/srv/webapp/config.yml' } },
          { type: 'file_type', label: '/srv/webapp/config.yml must be a real file made with a hard link (not a symbolic link)', params: { path: '/srv/webapp/config.yml', expected: 'regular file' } },
          { type: 'hardlink_exists', label: '/srv/webapp/config.yml and /srv/webapp/settings.yml must be the same file (one copy shared by both names)', params: { a: '/srv/webapp/config.yml', b: '/srv/webapp/settings.yml' } },
          { type: 'file_linkcount', label: '/srv/webapp/config.yml must have a link count of 2 (two names pointing to the one file)', params: { path: '/srv/webapp/config.yml', expected: '2' } },
          { type: 'file_contains', label: '/srv/webapp/config.yml must show the same content as /srv/webapp/settings.yml', params: { path: '/srv/webapp/config.yml', needle: 'app_port: 8080' } },
        ],
      },
      {
        title: 'Recreate the assets symbolic link',
        instructions: [
          'Inspect /srv/webapp/www and /srv/webapp/shared-assets.',
          'Create www/assets as a SYMBOLIC LINK to the shared asset store. An absolute path works, and so does a relative one that resolves correctly from inside www/.',
          'Verify: ls -l /srv/webapp/www shows assets as a link (type l) with an arrow to its target.',
          'Prove it resolves: read a file that only exists in shared-assets through the link, e.g. cat /srv/webapp/www/assets/logo.png.',
        ],
        checks: [
          { type: 'symlink_exists', label: 'Make /srv/webapp/www/assets a symbolic link', params: { path: '/srv/webapp/www/assets' } },
          { type: 'dir_exists', label: 'The /srv/webapp/www/assets link must open the /srv/webapp/shared-assets folder', params: { path: '/srv/webapp/www/assets' } },
          { type: 'file_exists', label: 'logo.png must be reachable through /srv/webapp/www/assets/', params: { path: '/srv/webapp/www/assets/logo.png' } },
          { type: 'file_contains', label: 'Reading logo.png through /srv/webapp/www/assets/ must show its content', params: { path: '/srv/webapp/www/assets/logo.png', needle: 'GLBX-LOGO-DATA' } },
        ],
      },
    ],
  },
  {
    title: 'AdzPilot AI — Onboard 4 new engineers',
    categorySlug: 'user-management',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    points: 150,
    scenario:
      'AdzPilot AI is scaling up. Prasad, Jayesh, Yash and Ankit are joining tomorrow as engineers, ' +
      'and it is your job to set up their Linux accounts so they can start on day one. ' +
      'Create exactly these four accounts and nothing else — no extra users.',
    objectives: [
      'Create user accounts for prasad, jayesh, yash and ankit',
      'Give each engineer a home directory and a /bin/bash login shell',
      'Create the engineers group',
      'Add all four engineers to the engineers group',
      'Set the correct owner and permissions on each home directory',
    ],
    requirements: [
      'Users prasad, jayesh, yash and ankit exist',
      'Each engineer uses /bin/bash as their login shell',
      'Group engineers exists',
      'Every engineer is a member of the engineers group',
      'Each home directory is owned by its user with mode 750',
    ],
    instructions: [
      'Create the engineers group first.',
      'Create each user with a home directory and /bin/bash shell.',
      'Add all four engineers to the engineers group.',
      'Fix the owner and permissions of each home directory.',
      'Verify with: id prasad, groups jayesh, ls -ld /home/yash, getent passwd ankit',
    ],
    expectedOutcome:
      'id prasad, id jayesh, id yash and id ankit each show the engineers group, ' +
      'and every /home/<user> is owned by that user with mode 750.',
    learningOutcomes: [
      'Create multiple users and groups with useradd/groupadd',
      'Manage group membership with usermod -aG',
      'Set ownership with chown and modes with chmod',
    ],
    hints: [
      'Run groupadd engineers once, then useradd -m -s /bin/bash <user> for each engineer.',
      'Membership is added with usermod -aG engineers <user>.',
      'A correct home directory looks like drwxr-x--- <user> <user>.',
    ],
    solution:
      'groupadd engineers\n' +
      'useradd -m -s /bin/bash prasad\nuseradd -m -s /bin/bash jayesh\n' +
      'useradd -m -s /bin/bash yash\nuseradd -m -s /bin/bash ankit\n' +
      'usermod -aG engineers prasad\nusermod -aG engineers jayesh\n' +
      'usermod -aG engineers yash\nusermod -aG engineers ankit\n' +
      'chown prasad:prasad /home/prasad && chmod 750 /home/prasad\n' +
      'chown jayesh:jayesh /home/jayesh && chmod 750 /home/jayesh\n' +
      'chown yash:yash /home/yash && chmod 750 /home/yash\n' +
      'chown ankit:ankit /home/ankit && chmod 750 /home/ankit',
    validationRules: [
      { type: 'user_exists', label: 'Create the user prasad', params: { username: 'prasad' } },
      { type: 'user_exists', label: 'Create the user jayesh', params: { username: 'jayesh' } },
      { type: 'user_exists', label: 'Create the user yash', params: { username: 'yash' } },
      { type: 'user_exists', label: 'Create the user ankit', params: { username: 'ankit' } },
      { type: 'group_exists', label: 'Create the group engineers', params: { group: 'engineers' } },
      { type: 'command_contains', label: 'Add prasad to the engineers group', params: { command: 'groups prasad', needle: 'engineers' } },
      { type: 'command_contains', label: 'Add jayesh to the engineers group', params: { command: 'groups jayesh', needle: 'engineers' } },
      { type: 'command_contains', label: 'Add yash to the engineers group', params: { command: 'groups yash', needle: 'engineers' } },
      { type: 'command_contains', label: 'Add ankit to the engineers group', params: { command: 'groups ankit', needle: 'engineers' } },
      { type: 'command_contains', label: 'Set prasad login shell to /bin/bash', params: { command: 'getent passwd prasad', needle: '/bin/bash' } },
      { type: 'command_contains', label: 'Set jayesh login shell to /bin/bash', params: { command: 'getent passwd jayesh', needle: '/bin/bash' } },
      { type: 'command_contains', label: 'Set yash login shell to /bin/bash', params: { command: 'getent passwd yash', needle: '/bin/bash' } },
      { type: 'command_contains', label: 'Set ankit login shell to /bin/bash', params: { command: 'getent passwd ankit', needle: '/bin/bash' } },
      { type: 'file_owner', label: 'Make /home/prasad owned by prasad', params: { path: '/home/prasad', expected: 'prasad:prasad' } },
      { type: 'file_owner', label: 'Make /home/jayesh owned by jayesh', params: { path: '/home/jayesh', expected: 'jayesh:jayesh' } },
      { type: 'file_owner', label: 'Make /home/yash owned by yash', params: { path: '/home/yash', expected: 'yash:yash' } },
      { type: 'file_owner', label: 'Make /home/ankit owned by ankit', params: { path: '/home/ankit', expected: 'ankit:ankit' } },
      { type: 'file_permissions', label: 'Set /home/prasad permissions to 750', params: { path: '/home/prasad', expected: '750' } },
      { type: 'file_permissions', label: 'Set /home/jayesh permissions to 750', params: { path: '/home/jayesh', expected: '750' } },
      { type: 'file_permissions', label: 'Set /home/yash permissions to 750', params: { path: '/home/yash', expected: '750' } },
      { type: 'file_permissions', label: 'Set /home/ankit permissions to 750', params: { path: '/home/ankit', expected: '750' } },
    ],
  },
  {
    title: 'Backup, compress, and recover the server configuration',
    categorySlug: 'production-linux',
    difficulty: 'intermediate',
    estimatedMinutes: 40,
    points: 200,
    scenario:
      'Your server holds years of critical configuration under /etc and there is no backup anywhere — ' +
      'one bad change and the whole system could be unrecoverable. As the on-call Linux administrator you must ' +
      'create three compressed backups of /etc (gzip, bzip2 and xz), compare how well each one compresses, ' +
      'and then PROVE the backups actually work by restoring a copy into a recovery folder and checking the ' +
      'restored files against the live configuration. A backup you have never tested is not a backup.',
    objectives: [
      'Create the /backup directory',
      'Create a plain tar archive of /etc as /backup/etc_backup.tar',
      'Create a gzip-compressed archive /backup/etc_backup_gzip.tar.gz',
      'Create a bzip2-compressed archive /backup/etc_backup_bzip2.tar.bz2',
      'Create an xz-compressed archive /backup/etc_backup_xz.tar.xz',
      'Compare the archive sizes to see which compression wins',
      'Inspect the contents of an archive without extracting it',
      'Restore a copy of /etc from each archive and verify the restored files',
    ],
    requirements: [
      '/backup exists and holds all four archives',
      'etc_backup_gzip.tar.gz is real gzip data, etc_backup_bzip2.tar.bz2 is real bzip2 data, etc_backup_xz.tar.xz is real XZ data',
      'Each archive contains the /etc configuration tree',
      '/root/recovery_gzip, /root/recovery_bzip2 and /root/recovery_xz each contain a restored /etc/passwd',
    ],
    instructions: [
      'Create /backup, then create a plain tar archive of /etc: tar -cf /backup/etc_backup.tar /etc',
      'Create the three compressed archives: tar -czf /backup/etc_backup_gzip.tar.gz /etc, tar -cjf /backup/etc_backup_bzip2.tar.bz2 /etc and tar -cJf /backup/etc_backup_xz.tar.xz /etc',
      'Compare the sizes: ls -lh /backup — xz compresses the most, plain tar the least.',
      'Inspect without extracting: tar -tvf /backup/etc_backup_gzip.tar.gz and confirm etc/passwd and etc/hostname are listed.',
      'Restore a copy of each archive into its own recovery folder: mkdir /root/recovery_gzip && tar -xzf /backup/etc_backup_gzip.tar.gz -C /root/recovery_gzip (repeat with -xjf for bzip2 and -xJf for xz).',
      'Verify the restore: test -f /root/recovery_gzip/etc/passwd and compare with diff /etc/passwd /root/recovery_gzip/etc/passwd (no output means identical).',
    ],
    expectedOutcome:
      '/backup holds a plain tar plus gzip/bzip2/xz archives of /etc, each archive lists etc/passwd and etc/hostname, and the three recovery folders restore a byte-identical /etc/passwd.',
    learningOutcomes: [
      'Create tar archives with and without compression',
      'Choose between gzip, bzip2 and xz compression tools',
      'Inspect archive contents without extracting',
      'Verify a backup by restoring and comparing it',
    ],
    hints: [
      'The letter after -c picks the compression: -z = gzip, -j = bzip2, -J = xz.',
      'file /backup/etc_backup_gzip.tar.gz prints "gzip compressed data" — a quick way to confirm the format.',
      'Restoring into /root/recovery_* keeps the live /etc untouched while you test the archives.',
    ],
    solution:
      'mkdir -p /backup\n' +
      'tar -cf /backup/etc_backup.tar /etc\n' +
      'tar -czf /backup/etc_backup_gzip.tar.gz /etc\n' +
      'tar -cjf /backup/etc_backup_bzip2.tar.bz2 /etc\n' +
      'tar -cJf /backup/etc_backup_xz.tar.xz /etc\n' +
      'ls -lh /backup\n' +
      'tar -tvf /backup/etc_backup_gzip.tar.gz\n' +
      'mkdir -p /root/recovery_gzip /root/recovery_bzip2 /root/recovery_xz\n' +
      'tar -xzf /backup/etc_backup_gzip.tar.gz -C /root/recovery_gzip\n' +
      'tar -xjf /backup/etc_backup_bzip2.tar.bz2 -C /root/recovery_bzip2\n' +
      'tar -xJf /backup/etc_backup_xz.tar.xz -C /root/recovery_xz\n' +
      'diff /etc/passwd /root/recovery_gzip/etc/passwd && diff /etc/passwd /root/recovery_bzip2/etc/passwd && diff /etc/passwd /root/recovery_xz/etc/passwd',
    setupCommands: [],
    validationRules: [
      { type: 'dir_exists', label: 'Create the /backup directory', params: { path: '/backup' } },
      { type: 'file_exists', label: 'Create the plain archive /backup/etc_backup.tar', params: { path: '/backup/etc_backup.tar' } },
      { type: 'file_exists', label: 'Create the gzip archive /backup/etc_backup_gzip.tar.gz', params: { path: '/backup/etc_backup_gzip.tar.gz' } },
      { type: 'file_exists', label: 'Create the bzip2 archive /backup/etc_backup_bzip2.tar.bz2', params: { path: '/backup/etc_backup_bzip2.tar.bz2' } },
      { type: 'file_exists', label: 'Create the xz archive /backup/etc_backup_xz.tar.xz', params: { path: '/backup/etc_backup_xz.tar.xz' } },
      { type: 'command_contains', label: 'etc_backup_gzip.tar.gz must be real gzip data', params: { command: 'file /backup/etc_backup_gzip.tar.gz', needle: 'gzip compressed data' } },
      { type: 'command_contains', label: 'etc_backup_bzip2.tar.bz2 must be real bzip2 data', params: { command: 'file /backup/etc_backup_bzip2.tar.bz2', needle: 'bzip2 compressed data' } },
      { type: 'command_contains', label: 'etc_backup_xz.tar.xz must be real XZ data', params: { command: 'file /backup/etc_backup_xz.tar.xz', needle: 'XZ compressed data' } },
      { type: 'command_contains', label: 'The gzip archive must contain etc/passwd (inspect with tar -tvf)', params: { command: 'tar -tvf /backup/etc_backup_gzip.tar.gz', needle: 'etc/passwd' } },
      { type: 'dir_exists', label: 'Create the recovery folder /root/recovery_gzip', params: { path: '/root/recovery_gzip' } },
      { type: 'file_contains', label: 'Restore /etc/passwd from the gzip archive into /root/recovery_gzip', params: { path: '/root/recovery_gzip/etc/passwd', needle: 'root:x:0:0' } },
      { type: 'dir_exists', label: 'Create the recovery folder /root/recovery_bzip2', params: { path: '/root/recovery_bzip2' } },
      { type: 'file_contains', label: 'Restore /etc/passwd from the bzip2 archive into /root/recovery_bzip2', params: { path: '/root/recovery_bzip2/etc/passwd', needle: 'root:x:0:0' } },
      { type: 'dir_exists', label: 'Create the recovery folder /root/recovery_xz', params: { path: '/root/recovery_xz' } },
      { type: 'file_contains', label: 'Restore /etc/passwd from the xz archive into /root/recovery_xz', params: { path: '/root/recovery_xz/etc/passwd', needle: 'root:x:0:0' } },
    ],
    sections: [
      {
        title: 'Phase 1 — Take a plain backup of /etc',
        instructions: [
          'Create /backup to hold all the archives.',
          'Create a plain (uncompressed) tar archive of /etc: tar -cf /backup/etc_backup.tar /etc',
          'Confirm the archive exists: ls -lh /backup',
        ],
        checks: [
          { type: 'dir_exists', label: 'Create the /backup directory', params: { path: '/backup' } },
          { type: 'file_exists', label: 'Create the plain archive /backup/etc_backup.tar', params: { path: '/backup/etc_backup.tar' } },
        ],
      },
      {
        title: 'Phase 2 — Compress with gzip, bzip2 and xz',
        instructions: [
          'Create a gzip-compressed archive: tar -czf /backup/etc_backup_gzip.tar.gz /etc',
          'Create a bzip2-compressed archive: tar -cjf /backup/etc_backup_bzip2.tar.bz2 /etc',
          'Create an xz-compressed archive: tar -cJf /backup/etc_backup_xz.tar.xz /etc',
          'Compare the sizes with ls -lh /backup and note which tool compresses best.',
        ],
        checks: [
          { type: 'file_exists', label: 'Create the gzip archive /backup/etc_backup_gzip.tar.gz', params: { path: '/backup/etc_backup_gzip.tar.gz' } },
          { type: 'file_exists', label: 'Create the bzip2 archive /backup/etc_backup_bzip2.tar.bz2', params: { path: '/backup/etc_backup_bzip2.tar.bz2' } },
          { type: 'file_exists', label: 'Create the xz archive /backup/etc_backup_xz.tar.xz', params: { path: '/backup/etc_backup_xz.tar.xz' } },
          { type: 'command_contains', label: 'etc_backup_gzip.tar.gz must be real gzip data', params: { command: 'file /backup/etc_backup_gzip.tar.gz', needle: 'gzip compressed data' } },
          { type: 'command_contains', label: 'etc_backup_bzip2.tar.bz2 must be real bzip2 data', params: { command: 'file /backup/etc_backup_bzip2.tar.bz2', needle: 'bzip2 compressed data' } },
          { type: 'command_contains', label: 'etc_backup_xz.tar.xz must be real XZ data', params: { command: 'file /backup/etc_backup_xz.tar.xz', needle: 'XZ compressed data' } },
        ],
      },
      {
        title: 'Phase 3 — Inspect the archives without extracting',
        instructions: [
          'List the contents of the gzip archive: tar -tvf /backup/etc_backup_gzip.tar.gz',
          'Confirm etc/passwd and etc/hostname are inside the archive.',
        ],
        checks: [
          { type: 'command_contains', label: 'The gzip archive must contain etc/passwd (inspect with tar -tvf)', params: { command: 'tar -tvf /backup/etc_backup_gzip.tar.gz', needle: 'etc/passwd' } },
        ],
      },
      {
        title: 'Phase 4 — Recovery drill: restore and verify',
        instructions: [
          'Create the three recovery folders: mkdir -p /root/recovery_gzip /root/recovery_bzip2 /root/recovery_xz',
          'Restore each archive into its own folder: tar -xzf /backup/etc_backup_gzip.tar.gz -C /root/recovery_gzip (then -xjf for bzip2 and -xJf for xz).',
          'Verify a restored copy of /etc/passwd exists and matches the live one: diff /etc/passwd /root/recovery_gzip/etc/passwd',
        ],
        checks: [
          { type: 'dir_exists', label: 'Create the recovery folder /root/recovery_gzip', params: { path: '/root/recovery_gzip' } },
          { type: 'file_contains', label: 'Restore /etc/passwd from the gzip archive into /root/recovery_gzip', params: { path: '/root/recovery_gzip/etc/passwd', needle: 'root:x:0:0' } },
          { type: 'dir_exists', label: 'Create the recovery folder /root/recovery_bzip2', params: { path: '/root/recovery_bzip2' } },
          { type: 'file_contains', label: 'Restore /etc/passwd from the bzip2 archive into /root/recovery_bzip2', params: { path: '/root/recovery_bzip2/etc/passwd', needle: 'root:x:0:0' } },
          { type: 'dir_exists', label: 'Create the recovery folder /root/recovery_xz', params: { path: '/root/recovery_xz' } },
          { type: 'file_contains', label: 'Restore /etc/passwd from the xz archive into /root/recovery_xz', params: { path: '/root/recovery_xz/etc/passwd', needle: 'root:x:0:0' } },
        ],
      },
    ],
  },
];

async function seedDatabase() {
  await seedCatalog();

  for (const c of CATEGORIES) {
    await Category.updateOne(
      { slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      { $set: { ...c, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') } },
      { upsert: true }
    );
  }

  const catBySlug = {};
  const cats = await Category.find({});
  for (const c of cats) catBySlug[c.slug] = c._id;

  let tasksCreated = 0;
  if ((await Task.countDocuments()) === 0) {
    for (const t of SEED_TASKS) {
      const { categorySlug, ...taskData } = t;
      await Task.create({
        ...taskData,
        category: catBySlug[categorySlug],
        status: 'published',
        publishedAt: new Date(),
      });
      tasksCreated += 1;
    }
  } else {
    for (const t of SEED_TASKS) {
      const { categorySlug, ...taskData } = t;
      const existing = await Task.findOne({ title: taskData.title });
      if (!existing) {
        await Task.create({
          ...taskData,
          category: catBySlug[categorySlug],
          status: 'published',
          publishedAt: new Date(),
        });
        tasksCreated += 1;
      } else {
        await Task.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...taskData,
              setupCommands: taskData.setupCommands || [],
              sections: taskData.sections || [],
              validationRules: taskData.validationRules || [],
            },
          }
        );
      }
    }
  }

  return { categories: cats.length, tasks: await Task.countDocuments(), tasksCreated };
}

module.exports = { seedDatabase, CATEGORIES, SEED_TASKS };

if (require.main === module) {
  const mongoose = require('mongoose');
  const config = require('./config');
  mongoose
    .connect(config.mongodbUri)
    .then(seedDatabase)
    .then((r) => {
      console.log('[seed] done', r);
      process.exit(0);
    })
    .catch((e) => {
      console.error('[seed] failed', e);
      process.exit(1);
    });
}
