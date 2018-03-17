var watch = require('node-watch');
var fs = require('fs-extra');
var kill  = require('tree-kill');
const spawn = require('child_process').spawn;

const folderWatcher = require('../folder-watcher');
const vray = require('../vray-manager');

const localVrlClientFile = '/home/ec2-user/.Chaosgroup/vrlclient.xml';
const rootVrlClientFile =  '/root/.Chaosgroup/vrlclient.xml';

startOLS();

/*watch('/home/ec2-user/.ChaosGroup/vrlclient.xml', { recursive: true }, function(evt, name) {
  console.log()
  setTimeout(() => {
      createVrayServer();
  }, 1000);
});*/

const startOLS = async () => {
  await vray.createVrlClientFile('/home/ec2-user/.Chaosgroup/vrlclient.xml');
  fs.createReadStream(localVrlClientFile).pipe(fs.createWriteStream(rootVrlClientFile));
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
 