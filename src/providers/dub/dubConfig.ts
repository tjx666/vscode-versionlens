import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from "presentation/providers";
import { CachingOptions, ICachingOptions } from 'core/clients';

enum DubContributions {
  Caching = 'dub.caching',
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

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      DubContributions.Caching,
      'caching'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(DubContributions.DependencyProperties);
  }

  get apiUrl(): Array<string> {
    return this.extension.config.get(DubContributions.ApiUrl);
  }

}