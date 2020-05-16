import { VersionLensExtension } from "presentation/extension";
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