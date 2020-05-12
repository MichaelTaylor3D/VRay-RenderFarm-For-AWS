require("babel-register")({
  presets: ["es2015", "react"],
});

const ec2 = require("./aws-instances");
ec2.monitorRenderManager();
