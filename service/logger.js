const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

const logger = winston.createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'log/combined.log' })
  ]
});

export default logger;

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