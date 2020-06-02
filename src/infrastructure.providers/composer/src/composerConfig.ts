import { IFrozenOptions } from 'core.configuration';
import { ICachingOptions, IHttpOptions } from 'core.clients';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from 'core.providers';

import { ComposerContributions } from './definitions/eComposerContributions';

export class ComposerConfig extends AbstractProviderConfig {

  options: IProviderOptions = {
    providerName: 'composer',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
      ProviderSupport.InstalledStatuses,
    ],
    selector: {
      language: 'json',
      scheme: 'file',
      pattern: '**/composer.json',
    }
  }

  http: IHttpOptions;

  caching: ICachingOptions;

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    super(config);
    this.caching = caching;
    this.http = http;
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(ComposerContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.config.get(ComposerContributions.ApiUrl);
  }

}