const _ = require('lodash');
const path = require('path');
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Load credentials and set region from JSON file
AWS.config.loadFromPath('./aws-config.json');

// Create EC2 service object
ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

fse = require('fs-extra')
const exec = require('ssh-exec')

const describeInstances = async () => {
  return ec2.describeInstances().promise(); 
}

const getActiveWorkerIpList = async () => {
  const instanceInfo = await describeInstances();
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
  return ipAddresses;
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
  instanceInfo.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      if (instance.ImageId === 'ami-1ecb7164') {
       return instance;
      }
    });
  });
}

exports.workersAreActive = async () => {
  const workerCount = await getActiveWorkerCount();
  return workerCount.length !== 0;
}

exports.createNewOLS = async () => {
  const securityGroupId = 'sg-0f374f7d';
  const subNetId = 'subnet-3baa4614'

  var params = {
    ImageId: 'ami-a28704d8',
    InstanceType: 't2.large',
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
  
  data.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      if (instance.PrivateIpAddress === privateIpAddress) {
        console.log('');
        console.log("Created OLS at ", instance.PublicIpAddress);  
        console.log(`After about 5 mins frontend will be available at http://${instance.PublicIpAddress}:8080`);
        console.log(`You may also remote desktop at ${instance.PublicIpAddress}`);
        console.log(`    username: Administrator`);
        console.log(`    password: cL3$D?zyeLMTF99AAvS*Q3VI;x!A.;(G`);
      }
    });
  });
}

const wait3Seconds = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 30000);
  });
}

exports.createWorkers = async () => {
  const olsInstance = await getOLSInstanceInfo();
  const securityGroupId = olsInstance.SecurityGroups[0].GroupId;
  const subNetId = olsInstance.SubnetId

  var params = {
    ImageId: 'ami-7b1cad01',
    InstanceType: 't2.2xlarge',
    MinCount: 1,
    MaxCount: 10,
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

exports.workersStatusIsOk = async () => {
  return await ec2.waitFor('instanceStatusOk', params).promise();
}

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
  const workerIpAddresses = await getActiveWorkerIpList().join(';');
  return new Promise((resolve, reject) => {
    client.scp(config.vrlclient, {
      host: instance.ipAddress,
      username: 'ec2-user',
      privateKey: fs.readFileSync('./RenderFarm.pem'),
      path: '/home/ec2-user/.ChaosGroup/'
    }, (err) => {
      if (err) reject(err);
      if (runningInstances.length === (index + 1)) {
        setTimeout(() => {
          resolve();
        }, 5000);                
      }
    })
  });
}