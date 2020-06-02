import { IFrozenOptions } from 'core.configuration';

import { IProviderOptions } from './definitions/iProviderOptions';

export abstract class AbstractProviderConfig {

  config: IFrozenOptions;

  abstract options: IProviderOptions;

  constructor(config: IFrozenOptions) {
    this.config = config;
  }

}