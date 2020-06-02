import { ICachingOptions, IHttpOptions } from 'core.clients';

import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'presentation.providers';
import { VersionLensExtension } from 'presentation.extension';

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
    extension: VersionLensExtension,
    caching: ICachingOptions,
    http: IHttpOptions,
  ) {
    super(extension);

    this.caching = caching;
    this.http = http;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(DubContributions.DependencyProperties);
  }

  get apiUrl(): Array<string> {
    return this.extension.config.get(DubContributions.ApiUrl);
  }

}