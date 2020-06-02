import { ICachingOptions, IHttpOptions } from 'core.clients';
import { IFrozenOptions } from 'core.configuration';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'core.providers';

import { PubContributions } from './definitions/ePubContributions';

export class PubConfig extends AbstractProviderConfig {

  options: IProviderOptions = {
    providerName: 'pub',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
    ],
    selector: {
      language: "yaml",
      scheme: "file",
      pattern: "**/pubspec.yaml",
    }
  };

  caching: ICachingOptions;

  http: IHttpOptions;

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
    return this.config.get(PubContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.config.get(PubContributions.ApiUrl);
  }

}