// references
import * as VsCodeTypes from 'vscode';
import { ILogger } from 'core/generic/logging';
import { WinstonLogger } from './winstonLogger';

import {
  createOutputChannelTransport
} from './transports/outputChannelTransport';

const timestampFormat = 'YYYY-MM-DD HH:mm:ss';


export function createVersionLensLogger(
  configuration: VsCodeTypes.WorkspaceConfiguration
): ILogger {

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
          level: 'info',
          format: logFormat
        }
      )
    ]
  })

  return new WinstonLogger(winstonLogger, configuration)
}