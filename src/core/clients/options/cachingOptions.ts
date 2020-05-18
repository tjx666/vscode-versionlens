import { IConfig, AbstractConfig } from 'core/configuration';

export enum CachingContributions {
  CacheDuration = 'duration',
}

export class CachingOptions extends AbstractConfig {

  constructor(parentKey: string, config: IConfig, defaultKey?: string) {
    super(parentKey, config, defaultKey);
  }

  get duration(): number {
    return super.getOrDefault<number>(
      CachingContributions.CacheDuration,
      0
    );
  }

}