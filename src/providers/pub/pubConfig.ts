import { VersionLensExtension } from "presentation/extension";
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig,
} from "presentation/providers";
import { CachingOptions } from "core/clients";

enum PubContributions {
  Caching = 'pub.caching',
  DependencyProperties = 'pub.dependencyProperties',
  ApiUrl = 'pub.apiUrl',
}

export class PubConfig extends AbstractProviderConfig {

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

  caching: CachingOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      PubContributions.Caching,
      extension,
      'caching'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(PubContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.get(PubContributions.ApiUrl);
  }

}