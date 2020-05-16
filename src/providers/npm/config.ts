import { AppConfig } from "presentation/configuration";
import { PackageFileFilter, IPackageProviderOptions } from "core/packages";

enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

const options = {
  name: 'npm',
  group: ['tags', 'statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/package.json',
  }
}

export class NpmConfig implements IPackageProviderOptions {

  config: AppConfig;

  defaultDependencyProperties: Array<string>;

  constructor(config: AppConfig) {
    this.config = config;

    this.defaultDependencyProperties = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
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
      NpmContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getDistTagFilter() {
    return this.config.getOrDefault(
      NpmContributions.DistTagFilter,
      []
    );

  }

}
