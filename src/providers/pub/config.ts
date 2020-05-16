import { AppConfig } from "presentation/configuration";
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

  config: AppConfig;

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(config: AppConfig) {
    this.config = config;

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
    return this.config.getOrDefault(
      PubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.config.getOrDefault(
      PubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}