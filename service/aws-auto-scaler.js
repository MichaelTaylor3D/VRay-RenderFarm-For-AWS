require("babel-register")({
  presets: ["es2015", "react"],
});

const AWS = require("aws-sdk");
AWS.config.load({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const ec2 = new AWS.EC2({ apiVersion: "2016-11-15" });
const cloudwatch = new AWS.CloudWatch({ apiVersion: "2010-08-01" });
const myEc2 = require("./aws-instances");

const farmStartDate = new Date();

const instanceTypes = [
  "t2.micro",
  "t2.small",
  "t2.medium",
  "t2.large",
  "t2.xlarge",
  "t2.2xlarge",
  "m4.large",
  "m4.xlarge",
  "m4.2xlarge",
  "m4.4xlarge",
  "m4.10xlarge",
];

const wait30Secs = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
};

const monitorRenderManager = async () => {
  try {
    const { InstanceId, InstanceType } = await myEc2.getOLSInstanceInfo();

    const { Maximum: cpuUtilization } = await getCPUUtilization(InstanceId);
    console.log(cpuUtilization);
    if (cpuUtilization > 99) {
      console.log("CPU Usage really high, scaling to bigger instance");
      await scaleSmaller(InstanceId, InstanceType);
    } else if (cpuUtilization < 1) {
      console.log("CPU usage really low, scaling to lower instance");
      await scaleSmaller(InstanceId, InstanceType);
    } else {
      console.log("CPU usage good, maintaining current instance size");
    }
    await wait30Secs();
    return await monitorRenderManager();
  } catch (error) {
    console.log(error);
  }
};

const getCPUUtilization = async (instanceId) => {
  const yesturday = new Date();
  yesturday.setDate(yesturday.getDate() - 1);

  var params = {
    EndTime: new Date(),
    MetricName: "CPUUtilization",
    Namespace: "AWS/EC2",
    Period: 18000,
    StartTime: yesturday,
    Dimensions: [
      {
        Name: "InstanceId",
        Value: instanceId,
      },
    ],
    Statistics: ["Maximum"],
  };

  return new Promise((resolve, reject) => {
    cloudwatch.getMetricStatistics(params, function (err, data) {
      if (err) {
        reject(err, err.stack);
      } else {
        // console.log(data.Datapoints);
        resolve(data.Datapoints[0]);
      }
    });
  });
};

const scaleLarger = async (instanceId, currentSize) => {
  const currentInstanceTypeIndex = instanceTypes.findIndex(
    (type) => type === currentInstanceType
  );
  const nextTypeIndex =
    currentInstanceTypeIndex == 0
      ? currentInstanceTypeIndex
      : currentInstanceTypeIndex - 1;

  console.log(instanceTypes[currentInstanceTypeIndex]);

  if (nextTypeIndex === currentInstanceTypeIndex) return;

  var params = {
    InstanceIds: [instanceId],
  };
  await ec2.stopInstances(params).promise();
  await ec2.waitFor("instanceStopped", params).promise();
  await modifyInstanceSize(instanceId, instanceTypes[nextTypeIndex]);
  await ec2.startInstances(params).promise();
  await ec2.waitFor("instanceStatusOk", params).promise();
};

const scaleSmaller = async (instanceId, currentInstanceType) => {
  const currentInstanceTypeIndex = instanceTypes.findIndex(
    (type) => type === currentInstanceType
  );
  const nextTypeIndex =
    currentInstanceTypeIndex == 0
      ? currentInstanceTypeIndex
      : currentInstanceTypeIndex - 1;

  console.log(instanceTypes[currentInstanceTypeIndex]);

  if (nextTypeIndex === currentInstanceTypeIndex) return;

  var params = {
    InstanceIds: [instanceId],
  };
  await ec2.stopInstances(params).promise();
  await ec2.waitFor("instanceStopped", params).promise();
  await modifyInstanceSize(instanceId, instanceTypes[nextTypeIndex]);
  await ec2.startInstances(params).promise();
};

const modifyInstanceSize = async (instanceId, size) => {
  var params = {
    InstanceId: instanceId,
    InstanceType: {
      Value: size,
    },
  };
  return await ec2.modifyInstanceAttribute(params).promise();
};

if (!module.parent) {
  monitorRenderManager();
}
