import { IFrozenOptions } from 'core.configuration';
import { ICachingOptions, IHttpOptions } from 'core.clients';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'core.providers';

import { MavenContributions } from './definitions/eMavenContributions';

export class MavenConfig extends AbstractProviderConfig {

  options: IProviderOptions = {
    providerName: 'maven',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
    ],
    selector: {
      language: 'xml',
      scheme: 'file',
      pattern: '**/pom.xml',
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
    return this.config.get(MavenContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.config.get(MavenContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.config.get(MavenContributions.ApiUrl);
  }

}