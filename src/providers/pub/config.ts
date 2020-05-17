import { VersionLensExtension } from "presentation/extension";
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions,
} from "presentation/lenses";

enum PubContributions {
  DependencyProperties = 'pub.dependencyProperties',
  ApiUrl = 'pub.apiUrl',
}

export class PubConfig implements IProviderConfig {

  options: IProviderOptions = {
    providerName: 'pub',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
    ],
    selector: {
      language: "yaml",
      scheme: "file",
      pattern: "**/pubspec.yaml",
    }
  };

  extension: VersionLensExtension;

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;

    this.defaultDependencyProperties = [
      'dependencies',
      'dev_dependencies'
    ];

    this.defaultApiUrl = 'https://pub.dev/';
  }

  getDependencyProperties() {
    return this.extension.getOrDefault(
      PubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.extension.getOrDefault(
      PubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}