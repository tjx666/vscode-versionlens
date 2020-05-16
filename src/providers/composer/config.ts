import { IPackageProviderOptions, PackageFileFilter } from "core/packages";
import { VersionLensExtension } from 'presentation/extension';

enum ComposerContributions {
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
}

const options = {
  name: 'composer',
  group: ['tags'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/composer.json',
  }
}

export class ComposerConfig implements IPackageProviderOptions {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  extension: VersionLensExtension;

  constructor(extension: VersionLensExtension) {

    this.extension = extension;

    this.defaultDependencyProperties = [
      "require",
      "require-dev"
    ];

    this.defaultApiUrl = 'https://repo.packagist.org/p';
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
      ComposerContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.extension.getOrDefault(
      ComposerContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}
