import {
  CachingOptions,
  ICachingOptions,
  HttpOptions,
  IHttpOptions
} from 'core.clients';

import { VersionLensExtension } from 'presentation.extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from 'presentation.providers';

enum ComposerContributions {
  Caching = 'composer.caching',
  Http = 'composer.http',

  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
}

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

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      ComposerContributions.Caching,
      'caching'
    );

    this.http = new HttpOptions(
      extension.config,
      ComposerContributions.Http,
      'http'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(ComposerContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.config.get(ComposerContributions.ApiUrl);
  }

}