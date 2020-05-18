import { IConfig, AbstractConfig } from 'core/configuration';
import { LogLevelTypes } from 'core/logging';

export enum LoggingContributions {
  LoggingLevel = 'level',
}

export class LoggingOptions extends AbstractConfig {

  constructor(parentKey: string, config: IConfig) {
    super(parentKey, config);
  }

  get level(): LogLevelTypes {
    return super.get<LogLevelTypes>(LoggingContributions.LoggingLevel);
  }

}