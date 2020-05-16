import { ILogger } from 'core/logging';
import { WinstonLogger } from './winstonLogger';

import {
  createOutputChannelTransport
} from './transports/outputChannelTransport';

import { VersionLensExtension } from 'presentation/extension';

// todo extract to app config
const timestampFormat = 'YYYY-MM-DD HH:mm:ss';

export function createLogger(extension: VersionLensExtension): ILogger {

  const {
    createLogger,
    transports,
    format,
  } = require('winston');

  const logFormat = format.combine(
    // format.colorize(),
    format.timestamp({
      format: timestampFormat
    }),
    format.align(),
    format.simple(),
    format.splat(),
    format.printf(
      entry => `${entry.timestamp} ${entry.level}: ${entry.message}`,
    )
  );

  const winstonLogger = createLogger({
    transports: [
      // capture errors in the console
      new transports.Console({
        level: 'error',
        format: logFormat
      }),
      // send info to output channel
      createOutputChannelTransport(
        "VersionLens",
        {
          level: extension.logging.level,
          format: logFormat
        }
      )
    ]
  });

  return new WinstonLogger(winstonLogger);
}