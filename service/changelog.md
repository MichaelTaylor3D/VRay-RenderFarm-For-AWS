Render Queue Allows multiple projects to be uploaded at once
Saved Logs for easier debugging
Emails are sent on render error, with info about why it failed

Decrease cost of running farm by about 20%

Cost saving measures including
  - All Linux Render Farm - Including Render Manager
  - Farm Server Auto Terminates after 30 mins of idle time (can disable later when we need it to run full time)
  - Nodes are reused if another project is left in the queue, otherwise they will termininate

Updated Front End
  - More stable and better handling of token authentication
  - Optional add dropbox link instead of uploading the file through the file upload