// vscode references
import * as VsCodeTypes from 'vscode';

import {
  ILogger,
  ILoggingOptions
} from 'core.logging';

import { createOutputChannelTransport } from './transports/outputChannelTransport';

export function createWinstonLogger(
  outputChannel: VsCodeTypes.OutputChannel, loggingOptions: ILoggingOptions
): ILogger {
  const { loggers, format, transports } = require('winston');

  const logTransports = [
    // capture errors in the console
    new transports.Console({ level: 'error' }),

    // send info to output channel
    createOutputChannelTransport(outputChannel, { level: loggingOptions.level })
  ];

  const logFormat = format.combine(
    format.timestamp({ format: loggingOptions.timestampFormat }),
    format.simple(),
    format.splat(),
    format.printf(loggerFormatter)
  );

  return loggers.add(outputChannel.name, {
    format: logFormat,
    transports: logTransports,
  });
}

function loggerFormatter(entry) {
  return `${entry.timestamp} [${entry.namespace}] [${entry.level}]: ${entry.message}`
}