import { OptionsWithFallback } from 'core.configuration';
import { IFrozenRepository, Nullable } from 'core.generics';

import { CachingContributions, ICachingOptions } from '../definitions/iOptions';

export class CachingOptions extends OptionsWithFallback implements ICachingOptions {

  constructor(
    config: IFrozenRepository,
    section: string,
    fallbackSection: Nullable<string> = null
  ) {
    super(config, section, fallbackSection);
  }

  get duration(): number {
    const durationMin = this.getOrDefault<number>(
      CachingContributions.CacheDuration,
      0
    );
    // convert to milliseconds
    return durationMin * 60000;
  }

}