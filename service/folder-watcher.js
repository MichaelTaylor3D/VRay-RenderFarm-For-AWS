const { compose, filter, map } = require('ramda');
const fs = require('fs-extra');
const path = require('path');
const ec2 = require('./aws-instances');
const config = require('./config');
const logger = require('./logger');

const uploadDir = config.projectFolder;

let idleCount = 0;

const isDirectory = (source) => {
  return fs.lstatSync(source).isDirectory();
}

const getFoldersFromSource = async (source) => {
  try {
    return await Promise.resolve(fs.readdir(source).then(folderContents => {
      const filterMap = compose(filter(isDirectory), map(name => path.join(source, name)));
      return filterMap(folderContents);
    }));
  } catch(error) {
    return Promise.reject('Source folder does not exist');
  }
}

exports.getFoldersFromSource = getFoldersFromSource;

const foldersExistInSource = async (source) => {
  const folders = await getFoldersFromSource(source);
  return (folders.length !== 0);
}

export const wait30Seconds = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 30000);
  });
}

const watchFolderForNewProjects = async () => {
  logger.logInfo('Looking for new projects...');
  const foundProject = await foldersExistInSource(uploadDir);
  if(!foundProject) {
    idleCount++;
    
    // if idle for 30mins
    if (idleCount === 60) {
      ec2.terminateEntireFarm();
    }

    const workersAreActive = await ec2.workersAreActive();
    if (workersAreActive) {
      ec2.terminateAllWorkers();
    }

    await wait30Seconds();
    return await watchFolderForNewProjects();
  } else {
    idleCount = 0;
    return Promise.resolve(true);
  }
};

exports.watchFolderForNewProjects = watchFolderForNewProjects;