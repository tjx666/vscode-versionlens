import { KeyDictionary } from '/core/generic/collections';
import { ILogger, LogLevelTypes } from 'core/generic/logging';

let defaultLoggerIntercepts = {
  log: () => 0,
  error: () => 0,
  info: () => 0,
};

export class LoggerMock implements ILogger {

  intercepts: ILogger;

  constructor(intercepts = defaultLoggerIntercepts) {
    this.intercepts = intercepts;
  }

  log(level: LogLevelTypes, message: string, splats: KeyDictionary<any>): void {
    this.intercepts['log'](level, message, splats)
  }

  info(message: string, ...splats: any): void {
    this.intercepts['info'](message, splats);
  }

  error(message: string, ...splats: any): void {
    this.intercepts['error'](message, splats);
  }

}