import { ILogger, LogLevelTypes } from 'core/generic/logging';
import { AppConfig } from 'presentation/configuration';

export class WinstonLogger implements ILogger {

  winstonLogger: any;

  config: AppConfig;

  constructor(
    winstonLogger,
    config: AppConfig
  ) {
    this.winstonLogger = winstonLogger;
    this.config = config;
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