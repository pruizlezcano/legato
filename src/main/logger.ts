import winston from 'winston';
import { app } from 'electron';
import path from 'path';

const customLevels = {
  levels: {
    errorRender: 0,
    error: 1,
    warnRender: 2,
    warn: 3,
    infoRender: 4,
    info: 5,
  },
  colors: {
    errorRender: 'italic black redBG',
    error: 'red',
    warnRender: 'italic black yellowBG',
    warn: 'yellow',
    infoRender: 'italic black greenBG',
    info: 'green',
  },
};

winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      if (info.stack) {
        return `${info.timestamp} ${info.level}: ${info.message} - ${info.stack}`;
      }
      return `${info.timestamp} ${info.level}: ${info.message}`;
    }),
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(app.getPath('logs'), 'errors.log'),
      level: 'error',
      maxsize: 1000000,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(app.getPath('logs'), 'legato.log'),
      maxsize: 1000000,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          if (info.stack) {
            return `${info.level}: ${info.message} - ${info.stack}`;
          }
          return `${info.level}: ${info.message}`;
        }),
      ),
    }),
  );
}

export default logger;
