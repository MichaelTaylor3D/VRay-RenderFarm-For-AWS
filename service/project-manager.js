const _ = require('lodash');
const fs = require('fs-extra');
const folderWatcher = require('./folder-watcher');
const moment = require('moment');
const zipFolder = require('zip-folder');
const rimraf = require('rimraf');
const email = require('./email-manager');
const mkdirp = require('mkdirp');
const path = require('path');
const logger = require('./logger');

const config = require('../service/config');

const getOldestProjectFolder = async () => {
  const folders = await folderWatcher.getFoldersFromSource(config.projectFolder);
  
  if (folders.length === 0) return Promise.resolve('');

  // have to use for loop so we can await
  const folderInfo = [];
  for(let folder of folders) {
    if (await isValidVrSceneFolder(folder)) {
      folderInfo.push({path: folder, time: await fs.stat(folder).then(stat => stat.ctime)});
    } else {
      const msg = await cancelBadlyFormedProjectFolder(folder);
      return Promise.reject(msg);
    }    
  };

  const sortedDates = _.sortBy(folderInfo, folder => new moment(folder.time));
  return Promise.resolve(sortedDates[0].path); 
}

const cancelBadlyFormedProjectFolder = async (folderPath) => {
  const userData = await getUserDataFromFolder(folderPath);
  rimraf(folderPath, (err) => {
    if (err) logger.logError(err);
  });
  return 'Your project folder is badly formed, It should include 1 vrscene and a cooresponding resources folder on the top level'
}

export const getUserDataFromFolder = async (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(folderPath + '/userData.json', (error, data) => {
      if (error) reject('User Data not found for this project');
      resolve(JSON.parse(data.toString()));
    });
  });
}

export const deleteFolder = async (folderPath) => {
  rimraf(folderPath, (err) => {
    if (err) logger.logError(err);
  });
}

export const getVrSceneFilePath = async (folderPath) => {
  return await isValidVrSceneFolder(folderPath);
}

const isValidVrSceneFolder = async (folderPath) => {
  const folderContents = await fs.readdir(folderPath);
  const vrscene = folderContents.find(item => item.includes('.vrscene'));
  return Promise.resolve(vrscene);
}

export const getPathToNextProject = async () => {
  return await getOldestProjectFolder();
}

export const createProjectFolderIfDoesntExist = async (folderName) => {
  return new Promise((resolve, reject) => {
    mkdirp(config.projectFolder + folderName, () => {
      resolve(config.outputFolder + folderName);
    });
  });  
}

export const createUserOutputFolderIfDoesntExist = async (username) => {
  return new Promise((resolve, reject) => {
    mkdirp(config.outputFolder + username, () => {
      resolve(config.outputFolder + username);
    });
  });  
}

export const createProjectOutputFolderIfDoesntExist = async (userFolder, folderName) => {
  return new Promise((resolve, reject) => {
    mkdirp(userFolder + '/' + folderName, () => {
      resolve(userFolder + '/' + folderName);
    });
  });  
}

export const zipUpFolder = async (folderPath) => {
  return new Promise((resolve, reject) => {
    zipFolder(
      path.resolve(folderPath),
      path.resolve(folderPath + '.zip'), (err) => {
        if(err) {
          reject(err);
        } else {
          resolve(folderPath + '.zip');
        }
    });  
  });
}