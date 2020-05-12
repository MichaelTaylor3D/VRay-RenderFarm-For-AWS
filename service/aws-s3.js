const _ = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const logger = require("./logger");

// Load the SDK for JavaScript
var AWS = require("aws-sdk");
// Load credentials and set region from JSON file
AWS.config.load({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const config = {
  vrlclient: process.env.VRL_CLIENT,
  projectFolder: process.env.PROJECT_FOLDER,
  outputFolder: process.env.OUTPUT_FOLDER,
  s3Bucket: process.env.S3_BUCKET,
  olsAmiId: process.env.OLS_AMI_ID,
  olsInstanceType: process.env.OLS_INSTANCE_TYPE,
  olsSecurityGroupId: process.env.OLS_SECURITY_GROUP_ID,
  olsSubNetId: process.env.OLS_SUBNET_ID,
  renderNodeAmiId: process.env.RENDER_NODE_AMI_ID,
  region: process.env.AWS_REGION,
};

const uploadParams = { Bucket: config.s3Bucket, Key: "", Body: "" };

exports.uploadFile = async (filepath, { username }) => {
  const fileStream = fs.createReadStream(filepath);

  fileStream.on("error", (err) => reject(error));

  uploadParams.Body = fileStream;
  uploadParams.Key = `${username}/${path.basename(filepath)}`;

  try {
    const data = await s3.upload(uploadParams).promise();
    if (data) {
      const location = _.cloneDeep(data.Location);
      logger.logInfo("Upload Success", location);
      return Promise.resolve(location);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};
