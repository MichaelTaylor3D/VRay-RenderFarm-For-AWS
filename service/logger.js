const winston = require('winston');

export default winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'log/combined.log' })
  ]
});

export const logInfo = (message) => {
  logger.log({
    level: 'info',
    message
  });
}

export const logError = (message) => {
  logger.log({
    level: 'error',
    message
  });
}