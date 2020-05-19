import { AbstractOptions } from 'core/configuration';
import { LogLevelTypes } from 'core/logging';
import { IFrozenRespository } from 'core/generic/repositories';
import { ILoggingOptions } from './definitions/iLoggingOptions';

export enum LoggingContributions {
  LoggingLevel = 'level',
}

export class LoggingOptions extends AbstractOptions implements ILoggingOptions {

  constructor(config: IFrozenRespository, section: string) {
    super(config, section);
  }

  get level(): LogLevelTypes {
    return super.get<LogLevelTypes>(
      LoggingContributions.LoggingLevel
    );
  }

  get timestampFormat(): string { return 'YYYY-MM-DD HH:mm:ss' }

}