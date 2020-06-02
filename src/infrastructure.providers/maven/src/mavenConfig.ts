import { ICachingOptions, IHttpOptions } from 'core.clients';
import { VersionLensExtension } from 'presentation.extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from 'presentation.providers';
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
    extension: VersionLensExtension,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    super(extension);
    this.caching = caching;
    this.http = http;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(MavenContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.config.get(MavenContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.config.get(MavenContributions.ApiUrl);
  }

}