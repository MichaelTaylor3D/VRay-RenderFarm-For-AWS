require('babel-register')({
  presets: ['es2015', 'react']
});

const ec2 = require('../service/aws-instances');

process.chdir('../service');
ec2.createNewOLS();