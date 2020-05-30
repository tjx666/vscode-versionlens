import { CachingOptions, ICachingOptions, HttpOptions } from 'core.clients';
import { VersionLensExtension } from 'presentation.extension';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from 'presentation.providers';

enum DubContributions {
  Caching = 'dub.caching',
  Http = 'dub.http',

  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
}

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

  http: HttpOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      DubContributions.Caching,
      'caching'
    );

    this.http = new HttpOptions(
      extension.config,
      DubContributions.Http,
      'http'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(DubContributions.DependencyProperties);
  }

  get apiUrl(): Array<string> {
    return this.extension.config.get(DubContributions.ApiUrl);
  }

}