require('babel-register')({
  presets: ['es2015', 'react']
});

const ec2 = require('../service/aws-instances');
ec2.terminateEntireFarm();