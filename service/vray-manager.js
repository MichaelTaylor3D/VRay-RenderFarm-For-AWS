import { error } from "util";

const ip = require("ip");
const fs = require("fs");
const kill = require("tree-kill");
const ec2 = require("./aws-instances");
const path = require("path");
const projectManager = require("./project-manager");
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./scratch");
const logger = require("./logger");

const process = require("process");
const spawn = require("child_process").spawn;

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

export const startRender = async ({ token, username }, projectPath) => {
  const workerIpAddresses = await ec2.getActiveWorkerIpList();
  const vrsceneFile = await projectManager.getVrSceneFilePath(projectPath);
  const vrScenePath = projectPath + "/" + vrsceneFile;

  const userOutputFolder = await projectManager.createUserOutputFolderIfDoesntExist(
    username
  );

  const projectOutputFolder = await projectManager.createProjectOutputFolderIfDoesntExist(
    userOutputFolder,
    vrsceneFile.replace(".vrscene", "")
  );

  const imgPath = path
    .resolve(projectOutputFolder + "/" + vrsceneFile)
    .replace(".vrscene", ".png");

  const scriptArgs = [
    "-distributed=2",
    `-renderhost="${workerIpAddresses.join(";")}"`,
    `-transferAssets=2`,
    `-scenefile="${vrScenePath}"`,
    `-imgFile="${imgPath}"`,
    `-display=0`,
    `-resume=1`,
  ];

  const isWin = /^win/.test(process.platform);
  const isMac = /^darwin/.test(process.platform);

  let vrayPath;
  if (isWin) {
    // assumes set to PATH
    vrayPath = "vray";
  } else if (isMac) {
    // This is prob wrong
    vrayPath = "vray";
  } else {
    vrayPath =
      "/usr/ChaosGroup/V-Ray/Standalone_for_linux_x64/bin/linux_x64/gcc-4.4/vray";
  }

  const vrayProcess = spawn(vrayPath, scriptArgs);

  localStorage.setItem("vrayPid", vrayProcess.pid);
  localStorage.setItem("currentUser", token);

  vrayProcess.on("exit", (data) => {
    logger.logInfo("exit", data);
  });

  vrayProcess.on("error", error, () => {
    logger.logError(error.toString());
  });

  return new Promise((resolve, reject) => {
    vrayProcess.stdout.on("data", (data) => {
      logger.logInfo(data.toString());

      if (data.toString().includes("error: Cannot create output image file")) {
        kill(vrayProcess.pid);
        reject("Output path - No such file or directory");
      }

      if (data.toString().includes("Could not obtain a license")) {
        kill(vrayProcess.pid);
        reject(data.toString());
      }

      if (
        data
          .toString()
          .includes(
            "Local machine is not used for distributed rendering and no slaves can join"
          )
      ) {
        kill(vrayProcess.pid);
        reject(data.toString());
      }

      if (data.toString().includes("Error in file")) {
        kill(vrayProcess.pid);
        reject(data.toString());
      }

      if (data.toString().includes("Cleaning up bitmap manager")) {
        kill(vrayProcess.pid);
        logger.logInfo("Finished Render!...");
        resolve(projectOutputFolder);
      }
    });
  });
};

export const canUserCancelRender = ({ token }) => {
  const currentUser = localStorage.getItem("currentUser");
  return token === currentUser;
};

export const cancelRenderWithToken = ({ token }) => {
  if (canUserCancelRender) {
    cancelRender();
  }
};

export const cancelRender = () => {
  const vrayPid = localStorage.getItem("vrayPid");
  if (vrayPid) {
    kill(vrayPid);
  }

  localStorage.removeItem("vrayPid");
  localStorage.removeItem("currentUser");
};

export const logoutOffOLS = () => {
  return new Promise((resolve, reject) => {
    let scriptArgs = ["online", "disable"];

    const olsPath = getvrlctlpath();

    const child = spawn(olsPath, scriptArgs);

    logger.logInfo("Attempting to log out of OLS");

    child.stdout.on("data", (data) => {
      logger.logInfo(data.toString());
    });

    child.on("error", (err) => {
      reject("Could not locate vrlctl, did not disable OLS");
    });

    child.on("exit", (data) => {
      logger.logInfo("Logged out of OLS");
      resolve();
    });
  });
};

const getvrlctlpath = () => {
  const isWin = /^win/.test(process.platform);
  const isMac = /^darwin/.test(process.platform);

  let olsPath;
  if (isWin) {
    olsPath = "C:\\Program Files\\Chaos Group\\VRLService\\OLS\\vrlctl.cmd";
  } else if (isMac) {
    olsPath = "/Applications/ChaosGroup/VRLService/OLS/vrlctl";
  } else {
    olsPath = "/usr/ChaosGroup/VRLService/OLS/vrlctl";
  }

  return olsPath;
};

export const loginToOLS = () => {
  return new Promise((resolve, reject) => {
    let scriptArgs = [
      "online",
      "login",
      process.env.OLS_USERNAME,
      process.env.OLS_PASSWORD,
    ];

    const olsPath = getvrlctlpath();

    const child = spawn(olsPath, scriptArgs);

    logger.logInfo("Attempting to log into OLS");

    child.stdout.on("data", (data) => {
      logger.logInfo(data.toString());
    });

    child.on("error", (err) => {
      reject("Could not locate vrlctl, did not login to OLS");
    });

    child.on("exit", (data) => {
      logger.logInfo("Logged into OLS");
      resolve();
    });
  });
};

export const createVrlClientFile = () => {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(config.vrlclient);
    stream.once("open", function () {
      stream.write("<VRLClient>\n");
      stream.write("<LicServer>\n");

      stream.write(`<Host>${ip.address()}</Host>\n`);
      stream.write("<Port>30304</Port>\n");

      stream.write(`<Host1></Host1>\n`);
      stream.write("<Port1>30304</Port1>\n");

      stream.write(`<Host2></Host2>\n`);
      stream.write("<Port2>30304</Port2>\n");

      stream.write(`<User></User>\n`);
      stream.write("<Pass></Pass>\n");

      stream.write("</LicServer>\n");
      stream.write("</VRLClient>\n");
      stream.end();
      resolve();
    });
  });
};

export const startLocalOls = () => {
  return new Promise((resolve, reject) => {
    let scriptArgs = [];

    const isWin = /^win/.test(process.platform);
    const isMac = /^darwin/.test(process.platform);

    let olsPath;
    if (isWin) {
      // olsPath = 'C:\\Program Files\\Chaos Group\\VRLService\\OLS\\vrlctl.cmd';
    } else if (isMac) {
      // olsPath = '/Applications/ChaosGroup/VRLService/OLS/vrlctl';
    } else {
      olsPath =
        "/usr/ChaosGroup/VRLService/OLS/bin/registerLicenseServerAsService";
    }

    const child = spawn(olsPath, scriptArgs);

    logger.logInfo("Attempting to start local OLS");

    child.on("error", (err) => {
      reject("Could not start local OLS");
    });

    child.on("exit", (data) => {
      logger.logInfo("OLS Started");
      resolve();
    });
  });
};
