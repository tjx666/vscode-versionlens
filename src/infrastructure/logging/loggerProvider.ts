import {
  ILogger,
  ILoggerProvider,
  ILoggingOptions
} from 'core/logging';

import { createOutputChannelTransport } from './transports/outputChannelTransport';

class WinstonLoggerProvider implements ILoggerProvider {

  options: ILoggingOptions;

  transports: Array<any>;

  constructor(name: string, options: ILoggingOptions) {
    this.options = options;

    const { transports } = require('winston');

    this.transports = [
      // capture errors in the console
      new transports.Console({ level: 'error' }),

      // send info to output channel
      createOutputChannelTransport(
        name,
        { level: options.level }
      )
    ];

  }

  createLogger(category: string): ILogger {

    const { loggers, format } = require('winston');

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

let _singleton: WinstonLoggerProvider = null;

export function createLoggerProvider(name: string, options: ILoggingOptions): ILoggerProvider {
  if (_singleton === null) _singleton = new WinstonLoggerProvider(name, options);

  return _singleton
}