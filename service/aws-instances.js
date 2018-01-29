const _ = require('lodash');
const path = require('path');
const R = require('ramda');
const remoteClient = require('scp2');
const AWS = require('aws-sdk');
const fse = require('fs-extra');
const exec = require('ssh-exec');
const logger = require('./logger');

AWS.config.loadFromPath('../service/aws-config.json');
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

const config = require('../service/config.json');

export const describeInstances = async () => {
  return ec2.describeInstances().promise(); 
}

const instanceIsNotShuttingDown = (instance) => {
  const ignoreStatus = ['stopped', 'terminated', 'shutting-down'];
  return !ignoreStatus.includes(instance.State.Name);
}

const isInstanceARenderNode = (instance) => {
  return instanceIsNotShuttingDown(instance) 
  && R.contains({Key: 'Name', Value: 'VRay Render Node'}, instance.Tags);
}

export const getActiveWorkerIpList = async () => {
  const instanceInfo = await describeInstances();

  const getPrivateIpAddresses = R.compose(
    R.map(instance => instance.PrivateIpAddress),
    R.filter(instance => isInstanceARenderNode(instance)),
    R.chain(reservation => reservation.Instances)
  );

  const ipAddresses = getPrivateIpAddresses(instanceInfo.Reservations);

  return ipAddresses;
}

export const getActiveWorkerInstanceIds = async () => {
  const instanceInfo = await describeInstances();
  
  const getWorkerIds = R.compose(
    R.map(instance => instance.InstanceId),

    // No point
    R.filter(instance => isInstanceARenderNode(instance)),
    R.chain(reservation => reservation.Instances)
  );

  const workerIds = getWorkerIds(instanceInfo.Reservations);

  return Promise.resolve(workerIds);
}

const getActiveWorkerCount = async () => {
  const instanceInfo = await describeInstances();

  const getWorkerCount = R.compose(
    R.length,
    R.filter(tag => tag.Value.includes('VRay Render Node')),
    R.chain(instance => instance.Tags),
    R.filter(instance => instanceIsNotShuttingDown(instance)),
    R.chain(reservation => reservation.Instances)
  );

  return Promise.resolve(getWorkerCount(instanceInfo.Reservations));
}

export const getOLSInstanceInfo = async () => {
  const instanceInfo = await describeInstances();

  const findOlsInstance = R.compose(
    R.find(instance => instance.ImageId === config.olsAmiId && instanceIsNotShuttingDown(instance)),
    R.chain(reservation => reservation.Instances)    
  ); 

  const olsInstance = findOlsInstance(instanceInfo.Reservations);

  if (!olsInstance) {
    return createNewOLS()
      .then((instanceId) => olsStatusOk(instanceId))
      .then(() => getOLSInstanceInfo());
  } 
  logger.logInfo('Using OLS instance: ' + olsInstance.InstanceId);
  return Promise.resolve(olsInstance);
}

export const workersAreActive = async () => {
  const workerCount = await getActiveWorkerCount();
  return workerCount != 0;
}

export const createNewOLS = async () => {
  const params = {
    ImageId: config.olsAmiId,
    InstanceType: config.olsInstanceType,
    MinCount: 1,
    MaxCount: 1,
    NetworkInterfaces: [{
        AssociatePublicIpAddress: true,
        DeleteOnTermination: true,
        Description: 'Primary network interface',
        DeviceIndex: 0,
        SubnetId: config.olsSubNetId,
        Groups: [config.olsSecurityGroupId]          
    }],
  };

  let privateIpAddress;

  await ec2.runInstances(params).promise().then(data => {
    data.Instances.forEach(instance => {
      const instanceInfo = {
        instanceId: instance.InstanceId,
        ipAddress: instance.NetworkInterfaces[0].PrivateIpAddress
      };  
      privateIpAddress = instanceInfo.ipAddress;

      const {instanceId} = instanceInfo;      
      const tagParams = {Resources: [instanceId], Tags: [{
          Key: 'Name',
          Value: 'VRay License Server (Remote Started)'
        }]
      };  
      return ec2.createTags(tagParams).promise();
    });
  });

  logger.logInfo('Waiting 30 seconds to retreive OLS instance data...');
  await wait3Seconds();
  const data = await describeInstances();

  let instanceId;
  
  data.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      if (instance.PrivateIpAddress === privateIpAddress) {
        instanceId = instance.InstanceId;
        console.log('');
        console.log("Created OLS at ", instance.PublicIpAddress);  
        console.log(`After about 5 mins frontend will be available at http://${instance.PublicIpAddress}:8080`);
       // console.log(`You may also remote desktop at ${instance.PublicIpAddress}`);
       // console.log(`    username: Administrator`);
       // console.log(`    password: cL3$D?zyeLMTF99AAvS*Q3VI;x!A.;(G`);
      }
    });
  });

  return Promise.resolve(instanceId);
}

const wait3Seconds = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 30000);
  });
}

const waitSeconds = async (seconds) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, seconds);
  });
}

export const createSpotWorkers = async (userDate) => {
  const olsInstance = await getOLSInstanceInfo();

  logger.logInfo('Creating new set of workers');
 
  const securityGroupId = olsInstance.SecurityGroups[0].GroupId;
  const subNetId = olsInstance.SubnetId

  var params = {
    InstanceCount: userData.count, 
    LaunchSpecification: {
     ImageId: config.renderNodeAmiId, 
     InstanceType: userData.type, 
     NetworkInterfaces: [{
        AssociatePublicIpAddress: true,
        DeleteOnTermination: true,
        Description: 'Primary network interface',
        DeviceIndex: 0,
        SubnetId: subNetId,
        Groups: [securityGroupId]          
      }],
    }, 
    Type: 'persistent'
   };

   return await ec2.requestSpotInstances(params).promise().then(data => {
    data.Instances.forEach(instance => {
      const instanceInfo = {
        instanceId: instance.InstanceId,
        ipAddress: instance.NetworkInterfaces[0].PrivateIpAddress
      };  
      logger.logInfo("Created instance", instanceInfo);  
      const {instanceId} = instanceInfo;      
      const tagParams = {Resources: [instanceId], Tags: [{
          Key: 'Name',
          Value: 'VRay Render Node'
        }]
      };  
      return ec2.createTags(tagParams).promise();
    });
  });
}

export const createWorkers = async (userData) => {
  const olsInstance = await getOLSInstanceInfo();

  logger.logInfo('Creating new set of workers');
 
  const securityGroupId = olsInstance.SecurityGroups[0].GroupId;
  const subNetId = olsInstance.SubnetId

  const params = {
    ImageId: config.renderNodeAmiId,
    InstanceType: userData.type,
    MinCount: 1,
    MaxCount: userData.count,
    NetworkInterfaces: [{
        AssociatePublicIpAddress: true,
        DeleteOnTermination: true,
        Description: 'Primary network interface',
        DeviceIndex: 0,
        SubnetId: subNetId,
        Groups: [securityGroupId]          
    }],
  };

  return await ec2.runInstances(params).promise().then(data => {
    data.Instances.forEach(instance => {
      const instanceInfo = {
        instanceId: instance.InstanceId,
        ipAddress: instance.NetworkInterfaces[0].PrivateIpAddress
      };  
      logger.logInfo("Created instance", instanceInfo);  
      const {instanceId} = instanceInfo;      
      const tagParams = {Resources: [instanceId], Tags: [{
          Key: 'Name',
          Value: 'VRay Render Node'
        }]
      };  
      return ec2.createTags(tagParams).promise();
    });
  });
}

const olsStatusOk = async (instanceId) => {
  logger.logInfo('Waiting for OLS to fully come online');
  const params = {
    InstanceIds: [instanceId]
  };
  return await ec2.waitFor('instanceStatusOk', params).promise();
}

export const workersStatusIsOk = async () => {
  const workerInstanceIds = await getActiveWorkerInstanceIds();
  logger.logInfo('Waiting for workers to fully come online');
  const params = {
    InstanceIds: workerInstanceIds
  };
  return await ec2.waitFor('instanceStatusOk', params).promise();
}

export const getAllInstanceIds = async () => {
  const instanceInfo = await describeInstances();

  const getInstanceIds = R.compose(
    R.map(instance => instance.InstanceId),
    R.chain(reservation => reservation.Instances)
  );

  const instanceIds = getInstanceIds(instanceInfo.Reservations);

  return Promise.resolve(instanceIds);
}

export const terminateEntireFarm = async () => {
  const instanceIds = await getAllInstanceIds();
  
  instanceIds.forEach(instance => {
    ec2.terminateInstances({ InstanceIds: [instance] }).promise()
      .then(data => {
        for(var i in data.TerminatingInstances) {
          var instance = data.TerminatingInstances[i];
          logger.logInfo('TERMINATE:\t' + instance.InstanceId);                
        } 
      }).catch(error => logger.logError(err));
    }
  );
}

export const terminateAllWorkers = async () => {
  const workerInstanceIds = await getActiveWorkerInstanceIds();
  
  workerInstanceIds.forEach(worker => {
    ec2.terminateInstances({ InstanceIds: [worker] }).promise()
      .then(data => {
        for(var i in data.TerminatingInstances) {
          var instance = data.TerminatingInstances[i];
          logger.logInfo('TERMINATE:\t' + instance.InstanceId);                
        } 
      }).catch(error => logger.logError(err));
    }
  );
}

export const configureRemoteWorkers = async (userInfo, filePath) => {
  const workerIpAddresses = await getActiveWorkerIpList();
  logger.logInfo('Sending VRLClient to ' + workerIpAddresses);
  return new Promise((resolve, reject) => {
    workerIpAddresses.forEach((ipAddress, index) => {
      console.log(path.resolve(config.vrlclient));
      remoteClient.scp(path.resolve(config.vrlclient), {
        host: ipAddress,
        username: 'ec2-user',
        privateKey: fse.readFileSync('./RenderFarm.pem'),
        path: '/home/ec2-user/.ChaosGroup/'
      }, (err) => {
        if (err) reject(err);
        if (workerIpAddresses.length === (index + 1)) {
          setTimeout(() => {
            resolve();
          }, 5000);                
        }
      })
    });
  });
}

export const monitorRenderManager = async () => {
  var params = {
    InstanceIds: [ 'i-0dcae2ced34e92e9b' ],
    DryRun: false
  };
  ec2.monitorInstances(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data.InstanceMonitorings[0].Monitoring);           // successful response
  });
}