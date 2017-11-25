require('babel-register')({
  presets: ['es2015', 'react']
});

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const uuid = require('node-uuid');
const unzip = require('unzip2');
const path = require('path');
const fstream = require('fstream');
const request = require('superagent');
const projectManager = require('../service/project-manager');
const spawn = require('child_process').spawn;
const server = require('http').createServer(app);

const tokenHost = 'https://oonix.io/wp-json';

const publicDir = path.resolve(`${__dirname}/../client/build`);

app.use(express.static(publicDir))

app.get('/', (req, res) => {
 res.sendFile(path.join(publicDir, "index.html"));
});

app.use(fileUpload());

app.post('/api/submitAndDownload', async (req, res) => {
  if (!req.body.download) {
    res.status(400).send('You must specify a url to download');
  }

  try {
    await validateToken(req.body.token);
    res.send("Downloading project to server");

    const downloadName = uuid.v4();
    const downloadPath = `./tmp/${downloadName}.zip`;

    const scriptArgs = [
      '-L',
      '-o',
      downloadPath,
      req.body.download
    ]

    const process = spawn('curl', scriptArgs);

    process.on('exit', () => {      
      const userData = parseUserData(req);
      createProject(downloadPath, userData)      
    });
  } catch (error) {
    return res.status(500).send(error);
  }
})

app.post('/api/upload', async (req, res) => {
  try {
    await validateToken(req.body.token);
    console.log('token validated');
    let sceneFile = req.files[0];
    const filePath = `./tmp/${sceneFile.name}`;
    sceneFile.mv(filePath, (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      const userData = parseUserData(req);
      createProject(filePath, userData);
      res.send("File was download and submitted to render queue");
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

server.listen(8080, () => console.log('Server listening on port 8080!'));

const validateToken = (token) => {
  return new Promise((resolve, reject) => {
    request.post(`${tokenHost}/jwt-auth/v1/token/validate`)
      .set({'Authorization': 'Bearer ' + token})
      .send()
      .then(resolve)  
      .catch(reject)
  });
}

const parseUserData = (req) => {
  return {
    email: req.body.email,
    username: req.body.username,
    token: req.body.token,
    type: req.body.type,
    count: req.body.count,
    imgHeight: req.body.imgHeight || '',
    imgWidth: req.body.imgWidth || ''
  }
}

const createProject = async (filePath, userData) => {
  const projectName = uuid.v4();
  const projectFolder = await projectManager.createProjectFolderIfDoesntExist(projectName);

  const readStream = fs.createReadStream(filePath);
  const writeStream = fstream.Writer(projectFolder);
   
  readStream
    .pipe(unzip.Parse())
    .pipe(writeStream)
  
  writeStream.on('close', () => {
    const serializedUserData = JSON.stringify(userData);
    fs.writeFile(projectFolder + '/userData.json', serializedUserData);
    projectManager.deleteFolder(filePath);
  });
}