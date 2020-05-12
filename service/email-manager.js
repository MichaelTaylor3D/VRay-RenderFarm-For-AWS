const React = require("react");
const ReactDOMServer = require("react-dom/server");
const email = require("emailjs/email");
const logger = require("./logger");

const sendMessage = (message, txtMsg, subject, recipient) => {
  var server = email.server.connect({
    user: process.env.EMAIL_SERVER_USERNAME,
    password: process.env.EMAIL_SERVER_PASSWORD,
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    ssl: process.env.EMAIL_SERVER_USE_SSL,
  });

  var message = {
    text: txtMsg,
    from: `Renderfarm <${process.env.EMAIL_SERVER_USERNAME}>`,
    to: recipient,
    subject: subject,
    attachment: [{ data: message, alternative: true }],
  };

  // send the message and get a callback with an error or details of the message that was sent
  server.send(message, (err) => {
    if (err) logger.logError(err);
    logger.logInfo("email sent", recipient, message);
  });
};

exports.file = (url, recipient) => {
  const template = (
    <html>
      <p>Hi</p>
      <p>Your Image is ready!</p>
      <a href={`${url}`}>Download Here</a>
      <p>Reminder: This link will be available for 30 days</p>
      <p>Thanks,</p>
      <p>Your Renderfarm</p>
    </html>
  );

  const message = ReactDOMServer.renderToStaticMarkup(template);
  const subject = "Here is your Rendered Image";
  const textMsg = "Here is your rendered image: " + url;

  sendMessage(message, textMsg, subject, recipient);
};

exports.error = (recipient, msg) => {
  const template = (
    <html>
      <p>Hi</p>
      <p>Unfortuantly, the render failed</p>
      <p>
        Please check the following error and try again, if it doesnt look like
        the error is related to your file, please contact the admin
      </p>
      <p>Thanks,</p>
      <p>Your Renderfarm</p>
      <br />
      <p>Error:</p>
      <p>{msg.toString()}</p>
    </html>
  );

  const message = ReactDOMServer.renderToStaticMarkup(template);
  const subject = "Error rendering your vrscene";
  const textMsg = "";

  sendMessage(message, textMsg, subject, recipient);
};
