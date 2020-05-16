import { ILogger, LogLevelTypes } from 'core/logging';
import { AppConfig } from 'presentation/extension';

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

  debug(message: string, ...splats: any): void {
    this.winstonLogger.log(LogLevelTypes.Debug, message, ...splats);
  }

  info(message: string, ...splats: any): void {
    this.winstonLogger.log(LogLevelTypes.Info, message, ...splats);
  }

  error(message: string, ...splats: any): void {
    this.winstonLogger.log(LogLevelTypes.Error, message, ...splats);
  }

}