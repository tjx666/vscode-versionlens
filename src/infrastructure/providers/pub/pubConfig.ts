import {
  CachingOptions,
  ICachingOptions,
  HttpOptions,
  IHttpOptions,
} from "core/clients";

import { VersionLensExtension } from "presentation/extension";
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig,
} from "presentation/providers";

enum PubContributions {
  Caching = 'pub.caching',
  Http = 'pub.http',

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

  caching: ICachingOptions;

  http: IHttpOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      PubContributions.Caching,
      'caching'
    );

    this.http = new HttpOptions(
      extension.config,
      PubContributions.Http,
      'http'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(PubContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.config.get(PubContributions.ApiUrl);
  }

}