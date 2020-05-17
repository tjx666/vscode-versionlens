import { VersionLensExtension } from 'presentation/extension';
import {
  ProviderSupport,
  IProviderConfig,
  IProviderOptions
} from "presentation/lenses";

enum MavenContributions {
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

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;

    this.defaultDependencyProperties = [
      'dependency',
      'parent'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
  }

  getDependencyProperties() {
    return this.extension.getOrDefault(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.extension.getOrDefault(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.extension.getOrDefault(
      MavenContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}