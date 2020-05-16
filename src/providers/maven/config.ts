import { AppConfig } from "presentation/extension";
import { PackageFileFilter, IPackageProviderOptions } from "core/packages";

enum MavenContributions {
  DependencyProperties = 'maven.dependencyProperties',
  TagFilter = 'maven.tagFilter',
  ApiUrl = 'maven.apiUrl',
}

const options = {
  name: 'maven',
  group: ['tags'],
  selector: {
    language: 'xml',
    scheme: 'file',
    pattern: '**/pom.xml',
  }
}

export class MavenConfig implements IPackageProviderOptions {

  config: AppConfig;

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(config: AppConfig) {
    this.config = config;

    this.defaultDependencyProperties = [
      'dependency',
      'parent'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
  }

  get providerName(): string {
    return options.name;
  }

  get group(): Array<string> {
    return options.group;
  }

  get selector(): PackageFileFilter {
    return options.selector;
  }

  getDependencyProperties() {
    return this.config.getOrDefault(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.config.getOrDefault(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.config.getOrDefault(
      MavenContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}