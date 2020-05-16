import { AppConfig } from "presentation/configuration";
import { IPackageProviderOptions, PackageFileFilter } from "core/packages";

enum DubContributions {
  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
}

const options = {
  name: 'dub',
  group: ['statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/{dub.json,dub.selections.json}',
  }
};

export class DubConfig implements IPackageProviderOptions {

  config: AppConfig;

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(config: AppConfig) {
    this.config = config

    this.defaultDependencyProperties = [
      'dependencies',
      'versions'
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
      DubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.config.getOrDefault(
      DubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}