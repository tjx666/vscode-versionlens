import { VersionLensExtension } from "presentation/extension";
import { PackageFileFilter, IPackageProviderOptions } from "core/packages";

enum PubContributions {
  DependencyProperties = 'pub.dependencyProperties',
  ApiUrl = 'pub.apiUrl',
}

const options = {
  name: 'pub',
  group: [],
  selector: {
    language: "yaml",
    scheme: "file",
    pattern: "**/pubspec.yaml",
  }
}

export class PubConfig implements IPackageProviderOptions {

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