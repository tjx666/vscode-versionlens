import { IFrozenRepository } from 'core.generics';
import { LogLevelTypes } from 'core.logging';
import { Options } from 'core.configuration';

import { ILoggingOptions } from './definitions/iLoggingOptions';

export enum LoggingContributions {
  LoggingLevel = 'level',
}

export class LoggingOptions extends Options implements ILoggingOptions {

  constructor(config: IFrozenRepository, section: string) {
    super(config, section);
  }

  get level(): LogLevelTypes {
    return super.get<LogLevelTypes>(
      LoggingContributions.LoggingLevel
    );
  }

  get timestampFormat(): string { return 'YYYY-MM-DD HH:mm:ss' }

}