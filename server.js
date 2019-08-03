var async_await_polyfill = "function async(sync_function) {\n    if (typeof require !== 'undefined' && parseFloat(require('process').version.slice(1)) >= 7.6) return sync_function;\n    var make_async = require('asyncawait/async');\n    var async_function = make_async (function async_function() {return sync_function(this, Array.prototype.slice.call(arguments))});\n    return async_function;\n};";
if (parseFloat(require('process').version.slice(1)) < 7.6) async_await_polyfill = "var await;\nif (parseFloat(require('process').version.slice(1)) < 7.6) await = require('asyncawait/await');\n" + async_await_polyfill;
process.chdir(__dirname);
process.on('uncaughtException', function(error) {
    if (process.argv.indexOf('--debug') !== -1) return;
    console.error(error.stack);
});
var child_process = require('child_process');
if (process.execPath.indexOf('.exe') !== -1) {
    process.execPath = 'node';
}
var fs = require('fs');
var conf = "" +
"master_password = yourpassword\n" +
"admin_password = r4pyd\n" +
"default_url = http://localhost\n" +
"port = 8069\n" +
"client_db = local\n" +
"server_db = main\n" +
"server_db_adapter = memory\n" +
"server_db_custom_adapter = False\n" +
"local_app = True\n" +
"serverless = False\n"
var modules_list = '';
var controllerst_list = '';
try {
    modules_list = child_process.execSync('cd modules && find * -maxdepth 1 -mindepth 1 | grep modules.pyj | grep -v .pyj-cached | tr / . | sed "s/.pyj//g" | sed "s/^/import /"', {cwd: __dirname}).toString();
    controllers_list = child_process.execSync('cd modules && find * -maxdepth 1 -mindepth 1 | grep controllers.pyj | grep -v .pyj-cached | tr / . | sed "s/.pyj//g" | sed "s/^/import /"', {cwd: __dirname}).toString();
    fs.writeFileSync(__dirname + '/modules/modules.pyj', modules_list);
    fs.writeFileSync(__dirname + '/modules/controllers.pyj', controllers_list);
    if (fs.existsSync(__dirname + '/app.conf') === false) {
        fs.writeFileSync(__dirname + '/app.conf', conf);
    }
} catch(error) {
    console.log(error);
}
conf = fs.readFileSync(__dirname + '/app.conf').toString();
if (conf !== '') {
    conf = conf.split(' =').join('=').split('= ').join('=').split('=').join('":"').replace(/(?:\r\n|\r|\n)/g, '","');
    conf = '{"' + conf.slice(0, -2) + '}';
    conf = JSON.parse(conf);
    process.env = Object.assign(process.env, conf);
}
var argv = ['', ''];
argv = argv.concat(['-p', 'modules/', '-x', 'server.pyj']);
var command = process.execPath + ' node_modules/rapydscript-ng/bin/rapydscript -p modules/';
if (process.env.custom_modules !== undefined && process.env.custom_modules !== false) {
    process.env.RAPYDSCRIPT_IMPORT_PATH = process.env.custom_modules;
    try {
        if (fs.existsSync(process.env.custom_modules + '/__init__.pyj') === false) {
            fs.writeFileSync(process.env.custom_modules + '/__init__.pyj', '');
        }
        modules_list += child_process.execSync('cd ' + process.env.custom_modules + ' && find * -maxdepth 1 -mindepth 1 | grep modules.pyj | grep -v .pyj-cached | tr / . | sed "s/.pyj//g" | sed "s/^/import /"', {cwd: __dirname}).toString();
        controllers_list += child_process.execSync('cd ' + process.env.custom_modules + ' && find * -maxdepth 1 -mindepth 1 | grep controllers.pyj | grep -v .pyj-cached | tr / . | sed "s/.pyj//g" | sed "s/^/import /"', {cwd: __dirname}).toString();
        fs.writeFileSync(__dirname + '/modules/modules.pyj', modules_list);
        fs.writeFileSync(__dirname + '/modules/controllers.pyj', controllers_list);
    } catch(error) {
        console.log(error);
    }
}
var pipe;
if (process.argv.indexOf('--print-file') !== -1 || process.argv.indexOf('--serverless') !== -1 || require.main !== module) {
    command += ' server.pyj'
    pipe = 'pipe';
    process.env.serverless = true;
} else {
    command += ' -x server.pyj';
    pipe = 'inherit';
}
if (process.argv.indexOf('--clear-cache') !== -1) {
    var clear_command = 'find . -name "*.pyj-cached" -type f -delete';
    child_process.execSync(clear_command, {cwd: __dirname, stdio: pipe, env: process.env});
}
if (process.argv.indexOf('--serverless') === -1) {
    var vm = require('vm');
    var runInNewContext = vm.runInNewContext;
    vm.runInNewContext = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args[2] === 'server.pyj') args[0] = async_await_polyfill + args[0];
        return runInNewContext.apply(vm, arguments);
    }
}
if (process.argv.indexOf('--print-file') !== -1 || process.argv.indexOf('--serverless') !== -1 || require.main !== module) {
    result = child_process.execSync(command, {cwd: __dirname, stdio: pipe, env: process.env});
    if (process.argv.indexOf('--print-file') !== -1) {
       console.log(async_await_polyfill + result.toString());
       process.exit();
    }
    eval(async_await_polyfill + 'var ρσ_module_doc__\n' + result.toString().replace(/async\(function/g, 'async(async function'));
}
else {
    process.argv = argv;
    require('rapydscript-ng/bin/rapydscript');
}
