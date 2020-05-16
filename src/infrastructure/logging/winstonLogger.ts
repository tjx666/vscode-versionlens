import { ILogger, LogLevelTypes } from 'core/logging';

export class WinstonLogger implements ILogger {

  winstonLogger: any;

  constructor(winstonLogger) {
    this.winstonLogger = winstonLogger;
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

  verbose(message: string, ...splats: any): void {
    this.winstonLogger.log(LogLevelTypes.Verbose, message, ...splats);
  }

}