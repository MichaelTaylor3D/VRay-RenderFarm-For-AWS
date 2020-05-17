## V-RAY Render farm for AWS

I am currently not actively developing this project, and am not supporting issues that may arise from its usage. However if someone would like to donate or commision me, I would be willing to pick it back up.

ENS: michael.taylor.dev.eth

ETHER ADDRESS: 0x411b4F2dCFE158114d9396A30c625Bf7DefAD880

---

This project was a fully functional renderfarm that would use your existing V-Ray licenses to build a temporary render farm on AWS to render .VRSCENE files.

It worked by creating a job queue, and it would continue rendering as long as the job queue had jobs. After about 30 mins of having an empty job queue, the renderfarm would automatically terminate to save money.

The results would automatically be uploaded to S3 and emailed back to you as a download link.

There is a frontend that would be created at the ip address of the main render farm node. This could be used to submit jobs to the active farm.

While this project is still intact, it relied on AMI images on AWS that are no longer available. If you would like to use this project you will need to build your own AMI images using a linux image with the following software:

- V-Ray Standalone
- the V-Ray Online License Server
- a clone of this project in the user directory.

The Online License Server (OLS) must be set to autostart when your AMI boots up.

You will also need to make sure some of the file and folder paths match between the linux image and this project.

While this project worked, I considered it half done and not user friendly. I also am currently not actively developing it.

If this project gets enough interest and anyone wants to donate or commission this project, I would be willing to finish it. Otherwise, your free to fork this and do build off it. I only ask that you credit my initial work.

---

## Project Structure

The project is split between 4 distinct components

- <ins>client</ins> - this is the frontend that allows you to upload projects to the renderfarm. It currently uploads directly to the AWS instance that manages the farm although a future enhancement was supposed to upload directly to an S3 bucket.
  The renderfarm will automatically serve this UI on the IP address of the Ec2 instance that is managing the farm. Note: currently the UI is authenticating against a wordpress installation to gain access to the UI. This is not required though and can be removed.
- <ins>manager</ins> - run `node start-farm.js` to manually start the farm from command line.
- <ins>server</ins> - this is the server that accepts render jobs from the UI and adds them to the queue. This server will also serve the UI. The server must be set to autorun on startup in the AMI that is configured to start when you initiate the farm. There are some sample tmux commands that can be used as startup scripts in the server folder.
- <ins>service</ins> - this is the renderfarm logic itself. It

## Important Commands to know

### from the manager directory

`node start-farm.js` - Starts the farm manually from your console

### from the service directory

`node terminate-entire-farm.js` - Immediately terminates the renderfarm

## required ENV variables

<table>
  <tr>
    <td>AWS_ACCESS_KEY_ID</td>
    <td>Your AWS access key id</td>
  </tr>
  <tr>
    <td>AWS_SECRET_ACCESS_KEY</td>
    <td>Your AWS secret keys</td>
  </tr>
  <tr>
    <td>AWS_REGION</td>
    <td>Your AWS region the AMI's are in</td>
  </tr>
  <tr>
    <td>OLS_AMI_ID</td>
    <td>The ID of your AMI</td>
  </tr>
  <tr>
    <td>OLS_INSTANCE_TYPE</td>
    <td>The name of th instance size (example: m5.24xlarge) </td>
  </tr>
  <tr>
    <td>OLS_SECURITY_GROUP_ID</td>
    <td>The security group your AMI is using</td>
  </tr>
  <tr>
    <td>OLS_SUBNET_ID</td>
    <td>The subnet your AMI is using</td>
  </tr>
  <tr>
    <td>OLS_USERNAME</td>
    <td>Your username for the V-Ray Online License Server</td>
  </tr>
  <tr>
    <td>OLS_PASSWORD</td>
    <td>Your password for the V-Ray Online License Server</td>
  </tr>
  <tr>
    <td>RENDER_NODE_AMI_ID</td>
    <td>The AMI you want to use as your render node. This can be the same as the OLS render node if you configure it correctly.</td>
  </tr>
  <tr>
    <td>S3_BUCKET</td>
    <td>The S# bucket you want to upload your rendered results in</td>
  </tr>
  <tr>
    <td>PROJECT_FOLDER</td>
    <td>Set this to ../uploads/</td>
  </tr>
    <tr>
    <td>OUTPUT_FOLDER</td>
    <td>Set this to ../output/</td>
  </tr>
  <tr>
    <td>VRL_CLIENT</td>
    <td>Set this to ./vrlclient.xml</td>
  </tr>
  <tr>
    <td>EMAIL_SERVER_USERNAME</td>
    <td>the email address to the email server that will send you job updates.</td>
  </tr>
  <tr>
    <td>EMAIL_SERVER_PASSWORD</td>
    <td>password to the email server that will send you job updates.</td>
  </tr>
  <tr>
    <td>EMAIL_SERVER_HOST</td>
    <td>Your email host</td>
  </tr>
  <tr>
    <td>EMAIL_SERVER_PORT</td>
    <td>the port to use for your email host</td>
  </tr>
  <tr>
    <td>EMAIL_SERVER_USE_SSL</td>
    <td>Does your email server require SSL?</td>
</table>
