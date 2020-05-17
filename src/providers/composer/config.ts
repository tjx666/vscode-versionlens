import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions
} from "presentation/lenses";

enum ComposerContributions {
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
}

export class ComposerConfig implements IProviderConfig {

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

  extension: VersionLensExtension

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;

    this.defaultDependencyProperties = [
      "require",
      "require-dev"
    ];

    this.defaultApiUrl = 'https://repo.packagist.org/p';
  }

  getDependencyProperties() {
    return this.extension.getOrDefault(
      ComposerContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.extension.getOrDefault(
      ComposerContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}