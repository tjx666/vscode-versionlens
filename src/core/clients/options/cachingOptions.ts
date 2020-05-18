import { AbstractOptions } from 'core/configuration';
import { CachingContributions, ICachingOptions } from '../definitions/options';
import { IFrozenRespository } from 'core/generic/repositories';

export class CachingOptions extends AbstractOptions implements ICachingOptions {

  constructor(config: IFrozenRespository, section: string, defaultSection?: string) {
    super(config, section, defaultSection);
  }

  get duration(): number {
    return super.getOrDefault<number>(
      CachingContributions.CacheDuration,
      0
    );
  }

}