import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions
} from "presentation/providers";

enum MavenContributions {
  CacheDuration = 'maven.caching.duration',
  DependencyProperties = 'maven.dependencyProperties',
  TagFilter = 'maven.tagFilter',
  ApiUrl = 'maven.apiUrl',
}

export class MavenConfig implements IProviderConfig {

  options: IProviderOptions = {
    providerName: 'maven',
    supports: [
      ProviderSupport.Releases,
      ProviderSupport.Prereleases,
    ],
    selector: {
      language: 'xml',
      scheme: 'file',
      pattern: '**/pom.xml',
    }
  };

  extension: VersionLensExtension;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;
  }

  get dependencyProperties(): Array<string> {
    return this.extension.get(MavenContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.get(MavenContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.get(MavenContributions.ApiUrl);
  }

  get cacheDuration(): number {
    return this.extension.getOrDefault<number>(
      MavenContributions.CacheDuration,
      this.extension.caching.duration
    );
  }

}