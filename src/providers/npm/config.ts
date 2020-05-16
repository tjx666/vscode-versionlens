import { VersionLensExtension } from "presentation/extension";
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

  extension: VersionLensExtension;

  defaultDependencyProperties: Array<string>;

  constructor(extension: VersionLensExtension) {
    this.extension = extension;

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
    return this.extension.getOrDefault(
      NpmContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getDistTagFilter() {
    return this.extension.getOrDefault(
      NpmContributions.DistTagFilter,
      []
    );

  }

}
