import { ICachingOptions, CachingOptions } from 'core/clients';
import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderOptions,
  AbstractProviderConfig
} from "presentation/providers";

enum MavenContributions {
  Caching = 'maven.caching',
  DependencyProperties = 'maven.dependencyProperties',
  TagFilter = 'maven.tagFilter',
  ApiUrl = 'maven.apiUrl',
}

export class MavenConfig extends AbstractProviderConfig {

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

  caching: ICachingOptions;

  constructor(extension: VersionLensExtension) {
    super(extension);

    this.caching = new CachingOptions(
      extension.config,
      MavenContributions.Caching,
      'caching'
    );
  }

  get dependencyProperties(): Array<string> {
    return this.extension.config.get(MavenContributions.DependencyProperties);
  }

  get tagFilter(): Array<string> {
    return this.extension.config.get(MavenContributions.DependencyProperties);
  }

  get apiUrl(): string {
    return this.extension.config.get(MavenContributions.ApiUrl);
  }

}