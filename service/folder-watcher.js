const { compose, filter, map} = require('ramda');
const fs = require('fs-extra');
const path = require('path')
const ec2 = require('./aws-instances');
const config = require('./config');

const uploadDir = config.projectFolder;

const isDirectory = (source) => {
  return fs.lstatSync(source).isDirectory();
}

const getFoldersFromSource = async (source) => {
  return await fs.readdir(source).then(folderContents => {
    const filterMap = compose(filter(isDirectory), map(name => path.join(source, name)));
    return filterMap(folderContents);
  });  
}

exports.getFoldersFromSource = getFoldersFromSource;

const foldersExistInSource = async (source) => {
  const folders = await getFoldersFromSource(source);
  return (folders.length !== 0);
}

const wait30Seconds = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 30000);
  });
}

const watchFolderForNewProjects = async () => {  
  const foundProject = await foldersExistInSource(uploadDir);
  if(!foundProject) {

    const workersAreActive = await ec2.workersAreActive();
    if (workersAreActive) {
      ec2.terminateAllWorkers();
    }

    await wait30Seconds();
    return await watchFolderForNewProjects();
  } else {
    return true;
  }
};

exports.watchFolderForNewProjects = watchFolderForNewProjects;