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

const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');

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
      localStorage.setItem('currentUserEmail', userData.email);
      
      const workersAreActive = await ec2.workersAreActive();
      if (!workersAreActive) {
        await ec2.createWorkers(userData);      
      }
      await ec2.workersStatusIsOk();
      await ec2.configureRemoteWorkers();
      const projectOutputFolder = await vray.startRender(userData, project);
      const bundledProject = await projectManager.zipUpFolder(projectOutputFolder);
      const fileDownload = await s3.uploadFile(bundledProject, userData);
      email.file(fileDownload, userData.email);
      projectManager.deleteProjectFolder(project);
    }
  } catch(error) {
    handleError(error);
  }
  
  start();
}

const handleError = (error) => {
  console.log('!: ' + error);

  const recipient = localStorage.getItem('currentUserEmail');
  if (recipient) {
    const regexRemoveIP = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):\d{1,5}\b/;
    email.error(recipient, error.replace(regexRemoveIP, ''));
  }

  localStorage.clear();
  
   start();
}

start();

