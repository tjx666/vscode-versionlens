import { KeyDictionary } from '/core/generics';
import { ILogger, LogLevelTypes, LoggerOptions } from 'core/logging';

let defaultLoggerIntercepts = {
  log: () => 0,
  debug: () => 0,
  error: () => 0,
  info: () => 0,
  verbose: () => 0,
  child: () => defaultLoggerIntercepts
};

export class LoggerMock implements ILogger {

  intercepts: ILogger;

  constructor(intercepts = defaultLoggerIntercepts) {
    this.intercepts = intercepts;
  }

  log(
    level: LogLevelTypes,
    message: string,
    splats: KeyDictionary<any>
  ): void {
    this.intercepts['log'](level, message, splats)
  }

  info(message: string, ...splats: any): void {
    this.intercepts['info'](message, splats);
  }

  debug(message: string, ...splats: any): void {
    this.intercepts['debug'](message, splats);
  }

  error(message: string, ...splats: any): void {
    this.intercepts['error'](message, splats);
  }

  verbose(message: string, ...splats: any): void {
    this.intercepts['verbose'](message, splats);
  }

  child(options: LoggerOptions): ILogger {
    return this;
  }

}