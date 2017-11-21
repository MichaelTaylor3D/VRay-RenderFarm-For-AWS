const _ = require('lodash');
const fs = require('fs-extra');
const folderWatcher = require('./folder-watcher');
const moment = require('moment');
const zipFolder = require('zip-folder');

const config = require('./config');

const getOldestProjectFolder = async () => {
  const folders = await folderWatcher.getFoldersFromSource(config.projectFolder);
  
  if (folders.length === 0) return Promise.resolve('');

  // have to use for so we can await
  const folderInfo = [];
  for(let folder of folders) {
    if (await isValidVrSceneFolder(folder)) {
      folderInfo.push({path: folder, time: await fs.stat(folder).then(stat => stat.ctime)});
    } else {
      await cancelBadlyFormedProjectFolder(folder);
      return Promise.reject('No valid vrscene file detected in project');
    }    
  };

  const sortedDates = _.sortBy(folderInfo, folder => new moment(folder.time));
  return Promise.resolve(sortedDates[0].path); 
}

const cancelBadlyFormedProjectFolder = async (folderPath) => {
  // get userdata
  // delete folder
  // email that project was canceled
}

exports.getUserDataFromFolder = async (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(folderPath + '/userData.json', (error, data) => {
      if (error) reject('User Data not found for this project');
      resolve(JSON.parse(data.toString()));
    })
  });
}

exports.getVrSceneFilePath = async (folderPath) => {

}

const isValidVrSceneFolder = async (folderPath) => {
  return Promise.resolve(true);
}

exports.getPathToNextProject = async () => {
  return await getOldestProjectFolder();
}

exports.zipFolder = async (folderPath) => {
  return new Promise((resolve, reject) => {
    zipFolder(
      Path.resolve(folderPath),
      Path.resolve(folderPath + '.zip'), function(err) {
        if(err) {
          reject(err);
        } else {
          resolve(folderPath + '.zip');
        }
    });  
  });
}