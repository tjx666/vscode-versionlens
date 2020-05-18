import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  IProviderConfig,
  ProviderSupport
} from "presentation/providers";

enum DubContributions {
  CacheDuration = 'dub.caching.duration',
  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
}

export class DubConfig implements IProviderConfig {

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

  extension: VersionLensExtension;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(DubContributions.DependencyProperties);
  }

  get apiUrl(): Array<string> {
    return this.extension.get(DubContributions.ApiUrl);
  }

  get cacheDuration(): number {
    return this.extension.getOrDefault<number>(
      DubContributions.CacheDuration,
      this.extension.caching.duration
    );
  }

}