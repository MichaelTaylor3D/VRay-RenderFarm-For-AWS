const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

// Load the SDK for JavaScript
var AWS = require('aws-sdk');
// Load credentials and set region from JSON file
AWS.config.loadFromPath('../service/aws-config.json');

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const config = require('../service/config.json');

const uploadParams = {Bucket: config.s3Bucket, Key: '', Body: ''};

exports.uploadFile = async (filepath, {username}) => {
  const fileStream = fs.createReadStream(filepath);
  fileStream.on('error', (err) => reject(error))
  uploadParams.Body = fileStream;
  uploadParams.Key = `${username}/${path.basename(filepath)}`;
  try {
    const data = await s3.upload(uploadParams).promise();
    if (data) {
      const location = _.cloneDeep(data.Location)
      logger.logInfo("Upload Success", location);
      return Promise.resolve(location);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}