const _ = require('lodash');
const path = require('path');
const remoteClient = require('scp2');
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Load credentials and set region from JSON file
AWS.config.loadFromPath('./aws-config.json');

// Create EC2 service object
ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

fse = require('fs-extra')
const exec = require('ssh-exec')

const config = require('./config.json');
const olsAmiId = 'ami-a28704d8';

const describeInstances = async () => {
  return ec2.describeInstances().promise(); 
}

const getActiveWorkerIpList = async () => {
  const instanceInfo = await describeInstances();
  return new Promise((resolve, reject) => {
    const ipAddresses = [];
    const ignoreStatus = ['stopped', 'terminated', 'shutting-down'];
  
    instanceInfo.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        instance.Tags.forEach(tag => {
          if (tag.Value === 'VRay Render Node' ) {
            if(!ignoreStatus.includes(instance.State.Name)) {
              ipAddresses.push(instance.PrivateIpAddress);
            }          
          }
        });
      });
    });
    resolve(ipAddresses);
  });
}

const getActiveWorkerInstanceIds = async () => {
  const instanceInfo = await describeInstances();
  const instanceIds = [];

  instanceInfo.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      instance.Tags.forEach(tag => {
        if (tag.Value === 'VRay Render Node' ) {
          instanceIds.push(instance.InstanceId);
        }
      });
    });
  });

  return instanceIds;
}

const getActiveWorkerCount = async () => {
  const instanceInfo = await describeInstances();
  let workerCount = 0;
 
  instanceInfo.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      instance.Tags.forEach(tag => {
        if (tag.Value === 'VRay Render Node' ) {
          workerCount++;
        }
      });
    });
  });

  return workerCount;
}

const getOLSInstanceInfo = async () => {
  const instanceInfo = await describeInstances();
  const ignoreStatus = ['stopped', 'terminated', 'shutting-down'];

  return new Promise((resolve, reject) => {
    let olsInstance;
    instanceInfo.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        if (instance.ImageId === olsAmiId && !ignoreStatus.includes(instance.State.Name)) {
          olsInstance = instance;       
        }
      });
    });
    if (olsInstance) {
      resolve(olsInstance);
    } else {
      return createNewOLS()
        .then((instanceId) => olsStatusOk(instanceId))
        .then(() => getOLSInstanceInfo());
    }
  })
}

exports.workersAreActive = async () => {
  const workerCount = await getActiveWorkerCount();
  return workerCount != 0;
}

const createNewOLS = async () => {
  const securityGroupId = 'sg-0f374f7d';
  const subNetId = 'subnet-3baa4614'
  
  var params = {
    ImageId: olsAmiId,
    InstanceType: 't2.nano', //'t2.large',
    MinCount: 1,
    MaxCount: 1,
    NetworkInterfaces: [{
        AssociatePublicIpAddress: true,
        DeleteOnTermination: true,
        Description: 'Primary network interface',
        DeviceIndex: 0,
        SubnetId: subNetId,
        Groups: [securityGroupId]          
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
      params = {Resources: [instanceId], Tags: [{
          Key: 'Name',
          Value: 'VRay License Server (Remote Started)'
        }]
      };  
      return ec2.createTags(params).promise();
    });
  });

  console.log('Waiting 30 seconds to retreive OLS instance data...');
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
        console.log(`You may also remote desktop at ${instance.PublicIpAddress}`);
        console.log(`    username: Administrator`);
        console.log(`    password: cL3$D?zyeLMTF99AAvS*Q3VI;x!A.;(G`);
      }
    });
  });
  console.log(instanceId);
  return Promise.resolve(instanceId);
}

exports.createNewOLS = createNewOLS;

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

exports.createWorkers = async (userData) => {
  const olsInstance = await getOLSInstanceInfo();
  console.log(olsInstance.PublicIpAddress);
  const securityGroupId = olsInstance.SecurityGroups[0].GroupId;
  const subNetId = olsInstance.SubnetId
return;
  const params = {
    ImageId: 'ami-7b1cad01',
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
      console.log("Created instance", instanceInfo);  
      const {instanceId} = instanceInfo;      
      params = {Resources: [instanceId], Tags: [{
          Key: 'Name',
          Value: 'VRay Render Node'
        }]
      };  
      return ec2.createTags(params).promise();
    });
  });
}

const olsStatusOk = async (instanceId) => {
  var params = {
    InstanceIds: [instanceId]
  };
  return await ec2.waitFor('instanceStatusOk', params).promise();
}

const workersStatusIsOk = async () => {
  return await ec2.waitFor('instanceStatusOk', params).promise();
}

exports.workersStatusIsOk = workersStatusIsOk;

const getAllInstanceIds = async () => {
  const instanceInfo = await describeInstances();
  const instanceIds = [];

  instanceInfo.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      instance.Tags.forEach(tag => {
          instanceIds.push(instance.InstanceId);
      });
    });
  });

  return instanceIds;
}

exports.terminateEntireFarm = async () => {
  const instanceIds = await getAllInstanceIds();
  
  instanceIds.forEach(instance => {
    ec2.terminateInstances({ InstanceIds: [instance] }).promise()
      .then(data => {
        for(var i in data.TerminatingInstances) {
          var instance = data.TerminatingInstances[i];
          console.log('TERMINATE:\t' + instance.InstanceId);                
        } 
      }).catch(error => console.log(err));
    }
  );
}

exports.terminateAllWorkers = async () => {
  const workerInstanceIds = await getActiveWorkerInstanceIds();
  
  workerInstanceIds.forEach(worker => {
    ec2.terminateInstances({ InstanceIds: [worker] }).promise()
      .then(data => {
        for(var i in data.TerminatingInstances) {
          var instance = data.TerminatingInstances[i];
          console.log('TERMINATE:\t' + instance.InstanceId);                
        } 
      }).catch(error => console.log(err));
    }
  );
}

exports.configureRemoteWorkers = async (userInfo, filePath) => {
  const workerIpAddresses = await getActiveWorkerIpList();
  console.log(workerIpAddresses);
  return new Promise((resolve, reject) => {
    workerIpAddresses.forEach(ipAddress => {
      remoteClient.scp(config.vrlclient, {
        host: ipAddress,
        username: 'ec2-user',
        privateKey: fs.readFileSync('./RenderFarm.pem'),
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