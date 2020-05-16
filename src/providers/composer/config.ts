import { IPackageProviderOptions, PackageFileFilter } from "core/packages";
import { AppConfig } from 'presentation/configuration';

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

  appConfig: AppConfig;

  constructor(appConfig: AppConfig) {

    this.appConfig = appConfig;

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
    return this.appConfig.getOrDefault(
      ComposerContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.appConfig.getOrDefault(
      ComposerContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}
