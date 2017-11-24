export default winston.createLogger({
  format: winston.format.json(),
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