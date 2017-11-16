import { userInfo } from 'os';

const ec2 = require('./aws-instances');
const s3 = require('./aws-s3');
const folderWatcher = require('./folder-watcher');
const projectManager = require('./project-manager');
const email = require('./email-manager');
const vray = require('./vray-manager');

const start = async () => {
  vray.createVrlClientFile();
  vray.loginToOLS();
  await folderWatcher.watchFolderForNewProjects();
  const project = await projectManager.getPathToNextProject();
  const userData = await projectManager.getUserDataFromFolder(project);
  const workersAreActive = await ec2.workersAreActive();
  if (!workersAreActive) {
    await ec2.createWorkers();
    await ec2.workersStatusIsOk();
  }
  await ec2.configureRemoteWorkers();
  const renderedImagePath = await vray.startRender(userInfo, project);
  const fileDownload = await s3.uploadFile(renderedImagePath, userInfo);
  email.file(fileDownload, userData.email);
  return await start();
}

start();

