import { VersionLensExtension } from "presentation/extension";
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

  extension: VersionLensExtension;

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(extension: VersionLensExtension) {
    this.extension = extension

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
    return this.extension.getOrDefault(
      DubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.extension.getOrDefault(
      DubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}