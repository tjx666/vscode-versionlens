import { AbstractOptions } from 'core/configuration';
import { LogLevelTypes } from 'core/logging';
import { IFrozenRespository } from 'core/generic/repositories';

export enum LoggingContributions {
  LoggingLevel = 'level',
}

export class LoggingOptions extends AbstractOptions {

  constructor(config: IFrozenRespository, section: string) {
    super(config, section);
  }

  get level(): LogLevelTypes {
    return super.get<LogLevelTypes>(
      LoggingContributions.LoggingLevel
    );
  }

}