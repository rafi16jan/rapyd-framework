#!/usr/bin/env node
process.chdir(__dirname);

const spawn_promise = require('util').promisify(require('child_process').spawn);
const spawn = (command, args) => spawn_promise(command, args, {env: process.env, stdio: 'inherit'});

const default_configuration =
`port = 8069
server_url = False
server_db = 'main'
server_db_adapter = 'memory'
server_db_custom_adapter = False
client_db = 'local'
`;

function create_configuration() {
  require('fs').writeFileSync('./orm/configuration.py', default_configuration);
}

async function compile() {
  if (!require('fs').existsSync('./orm/configuration.py')) create_configuration();
  if (process.argv.indexOf('--server') !== -1) return spawn('rpython', ['server.py']);
  if (process.argv.indexOf('--client') !== -1) return spawn('rpython', ['client.py']);
  process.env.CORE = require('os').cpus().filter((cpu) => cpu.speed).length;
  if (!process.env.CORE) process.env.CORE = parseInt(child_process.execSync('nproc').toString().trim());
  process.env.CORE = (process.env.CORE / 2).toString();
  await Promise.all([spawn('rpython', ['server.py']), spawn('rpython', ['client.py'])]);
}

compile().catch(console.error)
