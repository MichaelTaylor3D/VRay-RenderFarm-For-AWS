const _ = require('lodash');
const fs = require('fs-extra');
const folderWatcher = require('./folder-watcher');
const moment = require('moment');

const config = require('./config');

const getOldestProjectFolder = async () => {
  const folders = await folderWatcher.getFoldersFromSource(config.projectFolder);
  
  // have to use for so we can await
  const folderInfo = [];
  for(let folder of folders) {
    const isValidVrSceneFolder = await isValidVrSceneFolder(folder);
    if (isValidVrSceneFolder) {
      folderInfo.push({path: folder, time: await fs.stat(folder).then(stat => stat.ctime)});
    } else {
      cancelBadlyFormedProjectFolder(folder);
    }    
  };

  const sortedDates = _.sortBy(folderInfo, folder => new moment(folder.time));
  return sortedDates[0].path; 
}

const cancelBadlyFormedProjectFolder = async (folderPath) => {
  // get userdata
  // delete folder
  // email that project was canceled
}

exports.getUserDataFromFolder = async (folderPath) => {

}

exports.getVrSceneFilePath = async (folderPath) => {

}

const isValidVrSceneFolder = async (folderPath) => {

}

exports.getPathToNextProject = async () => {
  return await getOldestProjectFolder();
}