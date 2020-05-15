// references
import * as VsCodeTypes from 'vscode';

import { ILogger, LogLevelTypes } from 'core/generic/logging';

export class WinstonLogger implements ILogger {

  winstonLogger: any;
  configuration: VsCodeTypes.WorkspaceConfiguration;

  constructor(
    winstonLogger,
    configuration: VsCodeTypes.WorkspaceConfiguration
  ) {
    this.winstonLogger = winstonLogger;
    this.configuration = configuration;
  }

  log(level: LogLevelTypes, message: string, ...splats: any): void {
    this.winstonLogger.log(level, message, ...splats)
  }

  info(message: string, ...splats: any): void {
    this.winstonLogger.log(LogLevelTypes.Info, message, ...splats);
  }

  error(message: string, ...splats: any): void {
    this.winstonLogger.log(LogLevelTypes.Error, message, ...splats);
  }

}