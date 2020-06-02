import { KeyDictionary } from 'core.generics';
import { ILogger, LogLevelTypes, LoggerOptions } from 'core.logging';

let defaultLoggerIntercepts = {
  log: () => 0,
  debug: () => 0,
  error: () => 0,
  info: () => 0,
  verbose: () => 0,
  child: () => defaultLoggerIntercepts
};

export class LoggerStub implements ILogger {

  log(
    level: LogLevelTypes,
    message: string,
    splats: KeyDictionary<any>
  ): void { }

  info(message: string, ...splats: any): void { }

  debug(message: string, ...splats: any): void { }

  error(message: string, ...splats: any): void { }

  verbose(message: string, ...splats: any): void { }

  child(options: LoggerOptions): ILogger {
    return this;
  }

}