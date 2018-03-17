require('babel-register')({
  presets: ['es2015', 'react']
});

process.chdir('../');

var watch = require('node-watch');
var fs = require('fs-extra');
var kill  = require('tree-kill');
const spawn = require('child_process').spawn;
const path = require('path');

const folderWatcher = require('../folder-watcher');
const vray = require('../vray-manager');

const localVrlClientFile = '/home/ec2-user/.ChaosGroup/vrlclient.xml';
const rootVrlClientFile =  '/root/.ChaosGroup/vrlclient.xml';

const startOLS = async () => {
  await vray.createVrlClientFile();
  fs.copySync(path.resolve(__dirname,'../vrlclient.xml'), localVrlClientFile);
  fs.copySync(path.resolve(__dirname,'../vrlclient.xml'), rootVrlClientFile);
  await vray.startLocalOls();
  // needed to remove any login caching   
  await folderWatcher.wait30Seconds(); 
  await vray.logoutOffOLS()
  await folderWatcher.wait30Seconds();
  await vray.loginToOLS();

  createVrayServer();
}

const createVrayServer = () => {
  var scriptArgs = ['-server'];
  server = spawn('/usr/ChaosGroup/V-Ray/Standalone_for_linux_x64/bin/linux_x64/gcc-4.4/vray', scriptArgs);

  server.stdout.on('data', function(data) {
    console.log(data.toString());
  });

  return server;
}
 
  startOLS();