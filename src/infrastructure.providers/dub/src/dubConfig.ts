import { IFrozenOptions } from 'core.configuration';
import { ICachingOptions, IHttpOptions } from 'core.clients';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'core.providers';

import { DubContributions } from './definitions/eDubContributions';

export class DubConfig extends AbstractProviderConfig {

  options: IProviderOptions = {
    providerName: 'dub',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
      ProviderSupport.InstalledStatuses,
    ],
    selector: {
      language: 'json',
      scheme: 'file',
      pattern: '**/{dub.json,dub.selections.json}',
    }
  };

  caching: ICachingOptions;

  http: IHttpOptions;

  constructor(
    config: IFrozenOptions,
    caching: ICachingOptions,
    http: IHttpOptions,
  ) {
    super(config);

    this.caching = caching;
    this.http = http;
  }

  get dependencyProperties(): Array<string> {
    return this.config.get(DubContributions.DependencyProperties);
  }

  get apiUrl(): Array<string> {
    return this.config.get(DubContributions.ApiUrl);
  }

}