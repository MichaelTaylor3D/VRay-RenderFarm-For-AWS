// handle user media capture
export function captureUserMedia(callback) {
  var params = { audio: false, video: true };

  navigator.getUserMedia(params, callback, (error) => {
    alert(JSON.stringify(error));
  });
};

// handle S3 upload
function getSignedUrl(file) {
  var options = { method: 'POST',
    headers: {
      Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWM5NWMwMDdiZTBhOTAwMTJlM2M2NmIiLCJpYXQiOjE1MTA0MDc0OTQsImV4cCI6MTUxMTAxMjI5NH0.gMd2VZREO1gDcFSRtk312HF6GjVSnOtfLvQCdoywQGA",
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({
      type:"INTRO",
      filename:"raw/web/" + file.id + ".webm",
      contentType:file.type
    }),
    cache: 'default' };
  return fetch('https://viddy-dev.herokuapp.com/fileupload/awsurl', options)
    .then((response) => {

      return response.json();
    })
    .catch((err) => {
      console.log('error: ', err)
    })
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();

  if (xhr.withCredentials != null) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest !== "undefined") {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    xhr = null;
  }

  return xhr;
};

export function S3Upload(fileInfo) { //parameters: { type, data, id }
  return new Promise((resolve, reject) => {
    getSignedUrl(fileInfo)
      .then((s3Info) => {
        console.log(s3Info)
        // upload to S3
        var xhr = createCORSRequest('PUT', s3Info.url);

        xhr.onload = function() {
          if (xhr.status === 200) {
            console.log(xhr.status)
            resolve(true);
          } else {
            console.log(xhr.status)

            reject(xhr.status);
          }
        };

        xhr.setRequestHeader('Content-Type', fileInfo.type);
        //xhr.setRequestHeader('x-amz-acl', 'public-read');

        return xhr.send(fileInfo.data);
      })
  })
}