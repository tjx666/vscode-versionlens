import { IConfig } from 'core/configuration';

const defaultCacheDuration = 30000; // 5 mins

enum CachingContributions {
  // core config (todo move out of presentation)
  CacheDuration = 'caching.duration',
}

export class CachingOptions {

  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  get duration(): number {
    return this.config.getOrDefault<number>(
      CachingContributions.CacheDuration,
      defaultCacheDuration
    );
  }

}