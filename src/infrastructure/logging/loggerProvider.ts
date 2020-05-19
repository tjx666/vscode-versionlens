import {
  ILogger,
  ILoggerProvider,
  ILoggingOptions
} from 'core/logging';

import { createOutputChannelTransport } from './transports/outputChannelTransport';

class LoggerProvider implements ILoggerProvider {

  options: ILoggingOptions;

  transports: Array<any>;

  constructor(options: ILoggingOptions) {
    this.options = options;

    const { transports } = require('winston');

    this.transports = [
      // capture errors in the console
      new transports.Console({ level: 'error' }),

      // send info to output channel
      createOutputChannelTransport(
        "VersionLens",
        { level: options.level }
      )
    ];

  }

  createLogger(category: string): ILogger {

    const { loggers, format, } = require('winston');

    const logFormat = format.combine(
      // format.colorize(),
      format.label({ label: category }),
      format.timestamp({ format: this.options.timestampFormat }),
      format.align(),
      format.simple(),
      format.splat(),
      format.printf(
        entry => `${entry.timestamp} ${entry.level} ${entry.label}: ${entry.message}`,
      )
    );

    return loggers.add(category, {
      format: logFormat,
      transports: this.transports,
    });
  }

}

let _singleton: LoggerProvider = null;

export function createLoggerProvider(options: ILoggingOptions): ILoggerProvider {
  if (_singleton === null) _singleton = new LoggerProvider(options);

  return _singleton
}