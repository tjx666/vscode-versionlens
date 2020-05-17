import { VersionLensExtension } from 'presentation/extension';
import {
  IProviderOptions,
  IProviderConfig,
  ProviderSupport
} from "presentation/providers";

enum DubContributions {
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

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;

    this.defaultDependencyProperties = [
      'dependencies',
      'versions'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
  }

  getDependencyProperties() {
    return this.extension.getOrDefault(
      DubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.extension.getOrDefault(
      DubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}