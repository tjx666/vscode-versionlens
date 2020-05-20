import {
  ILogger,
  ILoggingOptions
} from 'core/logging';

import { createOutputChannelTransport } from './transports/outputChannelTransport';

export function createWinstonLogger(name: string, options: ILoggingOptions): ILogger {
  const { loggers, format, transports } = require('winston');

  const logTransports = [
    // capture errors in the console
    new transports.Console({ level: 'error' }),

    // send info to output channel
    createOutputChannelTransport(
      name,
      { level: options.level }
    )
  ];

  const logFormat = format.combine(
    format.timestamp({ format: options.timestampFormat }),
    format.simple(),
    format.splat(),
    format.printf(loggerFormatter)
  );

  return loggers.add(name, {
    format: logFormat,
    transports: logTransports,
  });
}

function loggerFormatter(entry) {
  return `${entry.timestamp} ${entry.level} ${entry.namespace}: ${entry.message}`
}