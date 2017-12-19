require('babel-register')({
  presets: ['es2015', 'react']
});

const email = require('./email-manager');

email.error('michael.d.taylor@gmail.com', 'test error');

/*
{
  "vrlclient": "./vrlclient.xml",
  "projectFolder": "../uploads/",
  "outputFolder": "../output/",
  "s3Bucket": "oonixrenderfarm",
  "olsAmiId": "ami-c694fdbc",
  "olsInstanceType": "t2.2xlarge", 
  "olsSecurityGroupId": "sg-7186db04",
  "olsSubNetId": "subnet-65b53f5a",
  "renderNodeAmiId": "ami-7b1cad01"
}
*/