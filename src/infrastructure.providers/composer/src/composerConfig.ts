import { ICachingOptions, IHttpOptions } from 'core.clients';

import { VersionLensExtension } from 'presentation.extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from 'presentation.providers';

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
    extension: VersionLensExtension,
    caching: ICachingOptions,
    http: IHttpOptions
  ) {
    super(extension);
    this.caching = caching;
    this.http = http;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(ComposerContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.config.get(ComposerContributions.ApiUrl);
  }

}