import { IFrozenOptions } from 'core.configuration';
import { ICachingOptions, IHttpOptions } from 'core.clients';
import { ProviderSupport, IProviderConfig, TProviderFileMatcher } from 'core.providers';

import { MavenContributions } from './definitions/eMavenContributions';

export class MavenConfig implements IProviderConfig {

  constructor(config: IFrozenOptions, caching: ICachingOptions, http: IHttpOptions) {
    this.config = config;
    this.caching = caching;
    this.http = http;
  }

  config: IFrozenOptions;

  providerName: string = 'maven';

  supports: Array<ProviderSupport> = [
    ProviderSupport.Releases,
    ProviderSupport.Prereleases,
  ];

  fileMatcher: TProviderFileMatcher = {
    language: 'xml',
    scheme: 'file',
    pattern: '**/pom.xml',
  };

  caching: ICachingOptions;

  http: IHttpOptions;

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