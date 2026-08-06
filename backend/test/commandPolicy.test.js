const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPolicy, checkCommand } = require('../src/services/commandPolicy');

function policy(rules) {
  return buildPolicy({ validationRules: rules });
}

const NGINX_TASK = policy([
  { type: 'package_installed', params: { package: 'nginx' } },
  { type: 'service_active', params: { service: 'nginx' } },
  { type: 'port_open', params: { port: 80 } },
  { type: 'file_exists', params: { path: '/var/www/acme/index.html' } },
  { type: 'file_contains', params: { path: '/etc/nginx/sites-available/acme', needle: 'listen' } },
]);

test('read-only inspection commands are always allowed', () => {
  for (const cmd of [
    'ls -la',
    'cat /etc/nginx/nginx.conf',
    'grep listen /etc/nginx/sites-available/acme',
    'pwd',
    'ss -tln',
    'ps aux',
    'find /etc/nginx -name "*.conf"',
  ]) {
    assert.equal(checkCommand(cmd, NGINX_TASK).allowed, true, cmd);
  }
});

test('package / service / firewall commands require the matching rule', () => {
  assert.equal(checkCommand('apt install -y nginx', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('systemctl restart nginx', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('ufw allow 80', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('systemctl restart mysql', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('crontab -l', NGINX_TASK).allowed, false);
});

test('destructive commands are blocked when they touch non-task paths', () => {
  assert.equal(checkCommand('rm /tmp/foo', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('rm -rf /', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('rm /var/www/acme/index.html', NGINX_TASK).allowed, true);
});

test('find is read-only unless a destructive flag is used', () => {
  assert.equal(checkCommand('find . -name "*.log"', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('find / -name passwd', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('find . -delete', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('find . -exec rm {} +', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('find . -ok rm {} ;', NGINX_TASK).allowed, false);
});

test('tar archives are only allowed for task paths', () => {
  assert.equal(checkCommand('tar -czf /root/backup.tgz /etc/nginx/sites-available/acme', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('tar -czf /tmp/x.tgz /etc', NGINX_TASK).allowed, false);
});

test('output redirection to a file requires the task path', () => {
  assert.equal(checkCommand('echo hi > /var/www/acme/index.html', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('cat > /etc/nginx/sites-available/acme', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('echo hi > /tmp/evil', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('echo hi > /dev/null', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('ls -la 2>&1 | grep nginx', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('echo "a > b"', NGINX_TASK).allowed, true);
});

test('cron is only allowed when the task has a cron rule', () => {
  assert.equal(checkCommand('crontab -l', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('echo x | crontab -', NGINX_TASK).allowed, false);

  const CRON_TASK = policy([
    { type: 'command_contains', params: { command: 'crontab -l', needle: '30 2' } },
    { type: 'file_exists', params: { path: '/usr/local/bin/backup.sh' } },
  ]);
  assert.equal(checkCommand('crontab -l', CRON_TASK).allowed, true);
  assert.equal(checkCommand('echo "30 2 * * * /usr/local/bin/backup.sh" | crontab -', CRON_TASK).allowed, true);
  assert.equal(checkCommand('cat > /usr/local/bin/backup.sh', CRON_TASK).allowed, true);
  assert.equal(checkCommand('echo hi > /tmp/x', CRON_TASK).allowed, false);
});

test('hardlink / symlink tasks scope file commands to their paths', () => {
  const LINK_TASK = policy([
    { type: 'file_exists', params: { path: '/srv/webapp/config.yml' } },
    { type: 'hardlink_exists', params: { a: '/srv/webapp/config.yml', b: '/srv/webapp/settings.yml' } },
    { type: 'symlink_exists', params: { path: '/srv/webapp/www/assets' } },
  ]);
  assert.equal(checkCommand('ln /srv/webapp/settings.yml /srv/webapp/config.yml', LINK_TASK).allowed, true);
  assert.equal(checkCommand('ln -s ../shared-assets /srv/webapp/www/assets', LINK_TASK).allowed, true);
  assert.equal(checkCommand('ln -s /etc/passwd /tmp/x', LINK_TASK).allowed, false);
});

test('user commands only target the task users', () => {
  const USER_TASK = policy([{ type: 'user_exists', params: { username: 'rahul' } }]);
  assert.equal(checkCommand('useradd rahul', USER_TASK).allowed, true);
  assert.equal(checkCommand('useradd bob', USER_TASK).allowed, false);
  assert.equal(checkCommand('cat /etc/passwd', USER_TASK).allowed, true);
});

test('safe file commands may create parent dirs of task paths, destructive ones may not', () => {
  assert.equal(checkCommand('mkdir -p /var/www/acme', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('mkdir -p /var/www', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('touch /var/www/acme/extra.txt', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('rm /var/www/acme/index.html', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('rm /var/www/acme', NGINX_TASK).allowed, false);
  assert.equal(checkCommand('rm -rf /var/www', NGINX_TASK).allowed, false);
});

test('daemon config tests and service commands are allowed for their service tasks', () => {
  assert.equal(checkCommand('nginx -t', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('nginx -s reload', NGINX_TASK).allowed, true);
  assert.equal(checkCommand('sshd -t', NGINX_TASK).allowed, true);

  const SSH_TASK = policy([
    { type: 'service_active', params: { service: 'ssh' } },
    { type: 'file_exists', params: { path: '/etc/ssh/sshd_config' } },
  ]);
  assert.equal(checkCommand('sshd -t', SSH_TASK).allowed, true);
  assert.equal(checkCommand('systemctl restart ssh', SSH_TASK).allowed, true);
  assert.equal(checkCommand('sshd -T', SSH_TASK).allowed, true);
});
