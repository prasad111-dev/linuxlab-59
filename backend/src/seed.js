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
      { type: 'user_exists', label: 'User rahul exists', params: { username: 'rahul' } },
      { type: 'group_exists', label: 'Group devteam exists', params: { group: 'devteam' } },
      { type: 'command_contains', label: 'rahul is a member of devteam', params: { command: 'groups rahul', needle: 'devteam' } },
      { type: 'file_permissions', label: '/home/rahul permissions are 750', params: { path: '/home/rahul', expected: '750' } },
      { type: 'file_owner', label: '/home/rahul owned by rahul:devteam', params: { path: '/home/rahul', expected: 'rahul:devteam' } },
      { type: 'command_contains', label: 'rahul login shell is /bin/bash', params: { command: 'getent passwd rahul', needle: '/bin/bash' } },
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
      { type: 'package_installed', label: 'Nginx is installed', params: { package: 'nginx' } },
      { type: 'file_exists', label: '/var/www/acme/index.html exists', params: { path: '/var/www/acme/index.html' } },
      { type: 'file_contains', label: 'index.html contains "Welcome to Acme Corp"', params: { path: '/var/www/acme/index.html', needle: 'Welcome to Acme Corp' } },
      { type: 'file_exists', label: '/etc/nginx/sites-available/acme exists', params: { path: '/etc/nginx/sites-available/acme' } },
      { type: 'file_exists', label: '/etc/nginx/sites-enabled/acme is enabled', params: { path: '/etc/nginx/sites-enabled/acme' } },
      { type: 'service_active', label: 'Nginx service is active', params: { service: 'nginx' } },
      { type: 'port_open', label: 'Port 80 is open', params: { port: 80 } },
      { type: 'command_contains', label: 'Site is served on port 80', params: { command: 'curl -s --max-time 5 http://127.0.0.1/', needle: 'Welcome to Acme Corp' } },
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
      { type: 'file_exists', label: '/usr/local/bin/backup.sh exists', params: { path: '/usr/local/bin/backup.sh' } },
      { type: 'file_permissions', label: 'backup.sh is executable (755)', params: { path: '/usr/local/bin/backup.sh', expected: '755' } },
      { type: 'file_contains', label: 'Script uses tar for the backup', params: { path: '/usr/local/bin/backup.sh', needle: 'tar' } },
      { type: 'dir_exists', label: '/backups directory exists', params: { path: '/backups' } },
      { type: 'command_contains', label: 'Cron job runs backup.sh daily at 02:30', params: { command: 'crontab -l', needle: '30 2' } },
      { type: 'command_contains', label: 'Cron job references the script', params: { command: 'crontab -l', needle: '/usr/local/bin/backup.sh' } },
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
      { type: 'file_contains', label: 'sshd_config sets PermitRootLogin no', params: { path: '/etc/ssh/sshd_config', needle: 'PermitRootLogin no' } },
      { type: 'user_exists', label: 'User deploybot exists', params: { username: 'deploybot' } },
      { type: 'command_contains', label: 'deploybot is in the sudo group', params: { command: 'groups deploybot', needle: 'sudo' } },
      { type: 'dir_exists', label: '/home/deploybot exists', params: { path: '/home/deploybot' } },
      { type: 'file_owner', label: '/home/deploybot owned by deploybot', params: { path: '/home/deploybot', expected: 'deploybot:deploybot' } },
      { type: 'service_active', label: 'SSH service is active', params: { service: 'ssh' } },
      { type: 'port_open', label: 'Port 22 is open', params: { port: 22 } },
    ],
  },
  {
    title: 'Onboard a TCS employee',
    categorySlug: 'user-management',
    difficulty: 'beginner',
    estimatedMinutes: 25,
    points: 120,
    scenario:
      'A new TCS employee, Priya Sharma, is joining the Infrastructure & Cloud team tomorrow morning. ' +
      'She needs a Linux workstation account with the right group memberships, a secured home directory, ' +
      'SSH key-based login, and sudo access for development tools. The HR ticket (INC-4821) is urgent — ' +
      'complete all steps so she can start on day one.',
    objectives: [
      'Create user priya with a home directory and bash shell',
      'Create groups tcs-employees and tcs-infra',
      'Add priya to both groups',
      'Set up SSH key authentication for priya',
      'Grant priya sudo access for development tools',
      'Set correct home directory permissions',
    ],
    requirements: [
      'User priya exists with /bin/bash as login shell',
      'Group tcs-employees exists',
      'Group tcs-infra exists',
      'priya is a member of both tcs-employees and tcs-infra',
      '/home/priya/.ssh/authorized_keys exists and is readable by priya',
      'priya has sudo access (is in the sudo group)',
      '/home/priya is owned by priya:priya with permissions 700',
    ],
    instructions: [
      'Create the tcs-employees and tcs-infra groups first.',
      'Create priya with a home directory, bash shell, and primary group priya.',
      'Add priya to both tcs-employees and tcs-infra groups.',
      'Create /home/priya/.ssh and add an authorized_keys file with a test public key.',
      'Add priya to the sudo group for development tool access.',
      'Lock down the home directory: owner priya, mode 700.',
      'Verify with: id priya, ls -la /home/priya/.ssh/, sudo -l -U priya',
    ],
    expectedOutcome:
      'id priya shows membership in priya, sudo, tcs-employees, and tcs-infra groups. ' +
      '/home/priya/.ssh/authorized_keys exists and the home directory is mode 700.',
    learningOutcomes: [
      'Create users and groups for enterprise environments',
      'Set up SSH key-based authentication',
      'Manage sudo access for developers',
      'Secure home directory permissions',
    ],
    hints: [
      'Use groupadd for each group, then useradd -m -s /bin/bash -G tcs-employees,tcs-infra priya.',
      'SSH keys go in /home/priya/.ssh/authorized_keys — create the .ssh dir first.',
      'Add sudo access with: usermod -aG sudo priya',
      'Home directory permissions: chmod 700 /home/priya',
    ],
    solution:
      'groupadd tcs-employees\n' +
      'groupadd tcs-infra\n' +
      'useradd -m -s /bin/bash -G tcs-employees,tcs-infra,sudo priya\n' +
      'mkdir -p /home/priya/.ssh\n' +
      'echo "ssh-rsa AAAA...priya-key" > /home/priya/.ssh/authorized_keys\n' +
      'chmod 700 /home/priya/.ssh\n' +
      'chmod 600 /home/priya/.ssh/authorized_keys\n' +
      'chown -R priya:priya /home/priya/.ssh\n' +
      'chmod 700 /home/priya',
    setupCommands: [],
    validationRules: [
      { type: 'user_exists', label: 'User priya exists', params: { username: 'priya' } },
      { type: 'group_exists', label: 'Group tcs-employees exists', params: { group: 'tcs-employees' } },
      { type: 'group_exists', label: 'Group tcs-infra exists', params: { group: 'tcs-infra' } },
      { type: 'command_contains', label: 'priya is in tcs-employees group', params: { command: 'groups priya', needle: 'tcs-employees' } },
      { type: 'command_contains', label: 'priya is in tcs-infra group', params: { command: 'groups priya', needle: 'tcs-infra' } },
      { type: 'command_contains', label: 'priya login shell is /bin/bash', params: { command: 'getent passwd priya', needle: '/bin/bash' } },
      { type: 'file_exists', label: '/home/priya/.ssh/authorized_keys exists', params: { path: '/home/priya/.ssh/authorized_keys' } },
      { type: 'file_permissions', label: '/home/priya/.ssh/authorized_keys is 600', params: { path: '/home/priya/.ssh/authorized_keys', expected: '600' } },
      { type: 'file_permissions', label: '/home/priya is mode 700', params: { path: '/home/priya', expected: '700' } },
      { type: 'command_contains', label: 'priya has sudo access', params: { command: 'groups priya', needle: 'sudo' } },
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
      'Create the three users: useradd ankit, useradd ram, useradd sham. Optionally set passwords with passwd.',
      'Create the shared directory: mkdir /shared',
      'Give everyone full access: chmod 777 /shared',
      'Switch to each user and create their own file: su - ankit, then touch /shared/ankit.txt, then exit.',
      'Before enabling the sticky bit, try (as ram) rm /shared/ankit.txt — it succeeds because 777 lets anyone delete.',
      'Enable the sticky bit: chmod 1777 /shared  (or chmod +t /shared)',
      'Verify with ls -ld /shared — it must show drwxrwxrwt.',
      'Test again as ram: rm /shared/ankit.txt must now be blocked with "Operation not permitted", while rm /shared/ram.txt still works.',
    ],
    expectedOutcome:
      'ls -ld /shared shows drwxrwxrwt, each user owns their own file, and a user can no longer delete another user\'s file.',
    learningOutcomes: [
      'Understand why a plain 777 directory is unsafe for sharing',
      'Set and verify the sticky bit with chmod 1777 / chmod +t',
      'Read the special permission t/T in ls -ld output',
    ],
    hints: [
      'The sticky bit is set with: chmod 1777 /shared  or  chmod +t /shared',
      'After enabling it, ls -ld /shared shows drwxrwxrwt (lowercase t).',
      'Uppercase T (drwxrwxrwT) means the sticky bit is set but the execute bit is missing — not what you want.',
      'Use su - <user> to switch to a user (then exit to return to root).',
      'Files must be created by the user themselves so ownership is correct.',
    ],
    solution:
      'useradd ankit\nuseradd ram\nuseradd sham\npasswd ankit\npasswd ram\npasswd sham\n' +
      'mkdir /shared\nchmod 777 /shared\n' +
      'su - ankit\ntouch /shared/ankit.txt\nexit\n' +
      'su - ram\ntouch /shared/ram.txt\nexit\n' +
      'su - sham\ntouch /shared/sham.txt\nexit\n' +
      'chmod 1777 /shared\nls -ld /shared',
    validationRules: [
      { type: 'user_exists', label: 'User ankit exists', params: { username: 'ankit' } },
      { type: 'user_exists', label: 'User ram exists', params: { username: 'ram' } },
      { type: 'user_exists', label: 'User sham exists', params: { username: 'sham' } },
      { type: 'dir_exists', label: '/shared directory exists', params: { path: '/shared' } },
      { type: 'file_permissions', label: 'Sticky bit is enabled on /shared (1777)', params: { path: '/shared', expected: '1777' } },
      { type: 'command_contains', label: 'ls -ld /shared shows drwxrwxrwt', params: { command: 'ls -ld /shared', needle: 'drwxrwxrwt' } },
      { type: 'file_exists', label: '/shared/ankit.txt exists', params: { path: '/shared/ankit.txt' } },
      { type: 'file_owner', label: '/shared/ankit.txt is owned by ankit', params: { path: '/shared/ankit.txt', expected: 'ankit:ankit' } },
      { type: 'file_exists', label: '/shared/ram.txt exists', params: { path: '/shared/ram.txt' } },
      { type: 'file_owner', label: '/shared/ram.txt is owned by ram', params: { path: '/shared/ram.txt', expected: 'ram:ram' } },
      { type: 'file_exists', label: '/shared/sham.txt exists', params: { path: '/shared/sham.txt' } },
      { type: 'file_owner', label: '/shared/sham.txt is owned by sham', params: { path: '/shared/sham.txt', expected: 'sham:sham' } },
    ],
    sections: [
      {
        title: 'Create the users and the shared directory',
        instructions: [
          'Create the three users: useradd ankit, useradd ram, useradd sham.',
          'Create the shared directory with: mkdir /shared',
          'Give everyone full access: chmod 777 /shared',
          'Check your progress: getent passwd ankit, ls -ld /shared',
        ],
        checks: [
          { type: 'user_exists', label: 'User ankit exists', params: { username: 'ankit' } },
          { type: 'user_exists', label: 'User ram exists', params: { username: 'ram' } },
          { type: 'user_exists', label: 'User sham exists', params: { username: 'sham' } },
          { type: 'dir_exists', label: '/shared directory exists', params: { path: '/shared' } },
        ],
      },
      {
        title: 'Enable the sticky bit and verify it protects files',
        instructions: [
          'Switch to each user and create their own file: su - ankit, then touch /shared/ankit.txt, then exit.',
          'Enable the sticky bit: chmod 1777 /shared  (or chmod +t /shared)',
          'Verify with ls -ld /shared — it must show drwxrwxrwt.',
          'Test as ram: rm /shared/ankit.txt must be blocked with "Operation not permitted".',
        ],
        checks: [
          { type: 'file_permissions', label: 'Sticky bit is enabled on /shared (1777)', params: { path: '/shared', expected: '1777' } },
          { type: 'command_contains', label: 'ls -ld /shared shows drwxrwxrwt', params: { command: 'ls -ld /shared', needle: 'drwxrwxrwt' } },
          { type: 'file_exists', label: '/shared/ankit.txt exists', params: { path: '/shared/ankit.txt' } },
          { type: 'file_owner', label: '/shared/ankit.txt is owned by ankit', params: { path: '/shared/ankit.txt', expected: 'ankit:ankit' } },
          { type: 'file_exists', label: '/shared/ram.txt exists', params: { path: '/shared/ram.txt' } },
          { type: 'file_owner', label: '/shared/ram.txt is owned by ram', params: { path: '/shared/ram.txt', expected: 'ram:ram' } },
          { type: 'file_exists', label: '/shared/sham.txt exists', params: { path: '/shared/sham.txt' } },
          { type: 'file_owner', label: '/shared/sham.txt is owned by sham', params: { path: '/shared/sham.txt', expected: 'sham:sham' } },
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
      'Start by auditing the tree: ls -la /opt/banking, find /opt/banking -maxdepth 1 -printf "%m %u:%g %p\\n", namei -l /opt/banking.',
      'Lock down the parent directory: chmod 755 /opt/banking.',
      'Config holds credentials — restrict it: chmod 640 /opt/banking/config.conf.',
      'Make the scripts executable but strip group/other write: chmod 755 /opt/banking/app.sh, chmod 755 /opt/banking/backup.sh. deploy.sh should already be 755.',
      'users.csv is read-only data: chmod 644 /opt/banking/users.csv.',
      'Team collaboration dirs: chmod 775 /opt/banking/reports, chmod 775 /opt/banking/logs, chmod 775 /opt/banking/shared.',
      'Scripts must inherit the owning group for new files: chmod 2775 /opt/banking/scripts.',
      'Uploads need the sticky bit so users cannot delete each other\'s files: chmod 1777 /opt/banking/uploads.',
      'Verify everything with: stat -c "%A %a %U:%G %n" /opt/banking/* and ls -ld /opt/banking/uploads.',
    ],
    expectedOutcome:
      'stat shows /opt/banking/config.conf as -rw-r-----, app.sh/deploy.sh/backup.sh as executable, ' +
      'scripts/ as drwxrwsr-x (SGID), uploads/ as drwxrwxrwt (sticky), and every directory without ' +
      'unnecessary world access.',
    learningOutcomes: [
      'Audit filesystem permissions with find, namei, and stat',
      'Set standard modes with numeric chmod',
      'Apply and verify the SGID and sticky special bits',
      'Reason about minimum privilege for production files',
    ],
    hints: [
      'Find every 777 first — those are the offenders: find /opt/banking -maxdepth 1 -printf "%m %p\\n".',
      'Use numeric modes (755, 640, 2775, 1777) with chmod; stat -c "%a" prints the numeric mode.',
      'drwxrwsr-x means 2775: the s in the group position is the SGID bit.',
      'drwxrwxrwt means 1777: the t in the others position is the sticky bit.',
      'The output of stat -c "%A" shows symbolic permissions; the numeric check uses stat -c "%a".',
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
      { type: 'file_permissions', label: '/opt/banking is locked down to 755', params: { path: '/opt/banking', expected: '755' } },
      { type: 'file_permissions', label: 'config.conf is restricted to 640', params: { path: '/opt/banking/config.conf', expected: '640' } },
      { type: 'file_permissions', label: 'app.sh is executable (755)', params: { path: '/opt/banking/app.sh', expected: '755' } },
      { type: 'file_permissions', label: 'deploy.sh is executable (755)', params: { path: '/opt/banking/deploy.sh', expected: '755' } },
      { type: 'file_permissions', label: 'backup.sh group/other write removed (755)', params: { path: '/opt/banking/backup.sh', expected: '755' } },
      { type: 'file_permissions', label: 'users.csv stays at 644', params: { path: '/opt/banking/users.csv', expected: '644' } },
      { type: 'file_permissions', label: 'reports/ is group-writable (775)', params: { path: '/opt/banking/reports', expected: '775' } },
      { type: 'file_permissions', label: 'logs/ is group-writable (775)', params: { path: '/opt/banking/logs', expected: '775' } },
      { type: 'file_permissions', label: 'scripts/ has the SGID bit (2775)', params: { path: '/opt/banking/scripts', expected: '2775' } },
      { type: 'command_contains', label: 'scripts/ shows SGID as drwxrwsr-x', params: { command: 'ls -ld /opt/banking/scripts', needle: 'drwxrwsr-x' } },
      { type: 'file_permissions', label: 'shared/ is 775', params: { path: '/opt/banking/shared', expected: '775' } },
      { type: 'file_permissions', label: 'uploads/ has the sticky bit (1777)', params: { path: '/opt/banking/uploads', expected: '1777' } },
      { type: 'command_contains', label: 'uploads/ shows sticky bit as drwxrwxrwt', params: { command: 'ls -ld /opt/banking/uploads', needle: 'drwxrwxrwt' } },
    ],
    sections: [
      {
        title: 'Lock down the application files',
        instructions: [
          'Audit first: ls -la /opt/banking, then find /opt/banking -maxdepth 1 -printf "%m %p\\n"',
          'Lock down the parent directory: chmod 755 /opt/banking',
          'Config holds credentials — restrict it: chmod 640 /opt/banking/config.conf',
          'Make the scripts executable: chmod 755 /opt/banking/app.sh, chmod 755 /opt/banking/backup.sh (deploy.sh should already be 755)',
          'users.csv is read-only data: chmod 644 /opt/banking/users.csv',
        ],
        checks: [
          { type: 'file_permissions', label: '/opt/banking is locked down to 755', params: { path: '/opt/banking', expected: '755' } },
          { type: 'file_permissions', label: 'config.conf is restricted to 640', params: { path: '/opt/banking/config.conf', expected: '640' } },
          { type: 'file_permissions', label: 'app.sh is executable (755)', params: { path: '/opt/banking/app.sh', expected: '755' } },
          { type: 'file_permissions', label: 'deploy.sh is executable (755)', params: { path: '/opt/banking/deploy.sh', expected: '755' } },
          { type: 'file_permissions', label: 'backup.sh group/other write removed (755)', params: { path: '/opt/banking/backup.sh', expected: '755' } },
          { type: 'file_permissions', label: 'users.csv stays at 644', params: { path: '/opt/banking/users.csv', expected: '644' } },
        ],
      },
      {
        title: 'Fix the shared directories with special bits',
        instructions: [
          'Team collaboration dirs: chmod 775 /opt/banking/reports, chmod 775 /opt/banking/logs, chmod 775 /opt/banking/shared',
          'Scripts must inherit the owning group for new files: chmod 2775 /opt/banking/scripts',
          'Uploads need the sticky bit so users cannot delete each other\'s files: chmod 1777 /opt/banking/uploads',
          'Verify everything: stat -c "%A %a %U:%G %n" /opt/banking/* and ls -ld /opt/banking/uploads',
        ],
        checks: [
          { type: 'file_permissions', label: 'reports/ is group-writable (775)', params: { path: '/opt/banking/reports', expected: '775' } },
          { type: 'file_permissions', label: 'logs/ is group-writable (775)', params: { path: '/opt/banking/logs', expected: '775' } },
          { type: 'file_permissions', label: 'scripts/ has the SGID bit (2775)', params: { path: '/opt/banking/scripts', expected: '2775' } },
          { type: 'command_contains', label: 'scripts/ shows SGID as drwxrwsr-x', params: { command: 'ls -ld /opt/banking/scripts', needle: 'drwxrwsr-x' } },
          { type: 'file_permissions', label: 'shared/ is 775', params: { path: '/opt/banking/shared', expected: '775' } },
          { type: 'file_permissions', label: 'uploads/ has the sticky bit (1777)', params: { path: '/opt/banking/uploads', expected: '1777' } },
          { type: 'command_contains', label: 'uploads/ shows sticky bit as drwxrwxrwt', params: { command: 'ls -ld /opt/banking/uploads', needle: 'drwxrwxrwt' } },
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
