import { IConfig } from 'core/configuration';
import { LogLevelTypes } from 'core/logging';

enum LoggingContributions {
  // core config (todo move out of presentation)
  LoggingLevel = 'logging.level',
}

export class LoggingOptions {

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  get level(): LogLevelTypes {
    return this.config.getOrDefault<LogLevelTypes>(
      LoggingContributions.LoggingLevel,
      LogLevelTypes.Info
    );
  }

}