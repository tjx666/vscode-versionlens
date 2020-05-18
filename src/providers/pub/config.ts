import { VersionLensExtension } from "presentation/extension";
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions,
} from "presentation/providers";

enum PubContributions {
  CacheDuration = 'pub.caching.duration',
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

  constructor(extension: VersionLensExtension) {
    this.extension = extension;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(PubContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.get(PubContributions.ApiUrl);
  }

  get cacheDuration(): number {
    return this.extension.getOrDefault<number>(
      PubContributions.CacheDuration,
      this.extension.caching.duration
    );
  }

}