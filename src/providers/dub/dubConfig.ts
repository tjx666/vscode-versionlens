import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  ProviderSupport,
  AbstractProviderConfig
} from "presentation/providers";
import { CachingOptions } from 'core/clients';

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

  caching: CachingOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      DubContributions.Caching,
      extension,
      'caching'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(DubContributions.DependencyProperties);
  }

  get apiUrl(): Array<string> {
    return this.extension.get(DubContributions.ApiUrl);
  }

}