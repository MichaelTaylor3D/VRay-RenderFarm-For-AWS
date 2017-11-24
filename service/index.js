require('babel-register')({
  presets: ['es2015', 'react']
});

const _ = require('lodash');
const ec2 = require('./aws-instances');
const s3 = require('./aws-s3');
const folderWatcher = require('./folder-watcher');
const projectManager = require('./project-manager');
const email = require('./email-manager');
const vray = require('./vray-manager');

const start = async () => {
  console.log('restarting farm');
  try {
    await vray.createVrlClientFile();
    await vray.loginToOLS();
    await folderWatcher.watchFolderForNewProjects();
    const project = await projectManager.getPathToNextProject()
    if (!_.isEmpty(project)) {
      console.log('Found New Project to Render');
      const userData = await projectManager.getUserDataFromFolder(project);
      const workersAreActive = await ec2.workersAreActive();
      if (!workersAreActive) {
        await ec2.createWorkers(userData);      
      }
      await ec2.workersStatusIsOk();
      await ec2.configureRemoteWorkers();
      console.log('SHORT CIRCUIT');
      return;
      const renderedImagePath = await vray.startRender(userData, project);
      const fileDownload = await s3.uploadFile(renderedImagePath, userData);
      email.file(fileDownload, userData.email);
    }
  } catch(error) {
    handleError(error);
  }
 // return await start();
}

const handleError = (error) => {
  console.log('!: ' + error);
  //email.error(recipiant, error);
  //start();
}

start();

