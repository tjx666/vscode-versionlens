import { AbstractProviderConfig } from 'core/configuration/abstractProviderConfig';

enum ComposerContributions {
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
}

const options = {
  group: ['tags'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/composer.json',
  }
}

export class ComposerConfig extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor() {
    super('composer', options);

    this.defaultDependencyProperties = [
      "require",
      "require-dev"
    ];

    this.defaultApiUrl = 'https://repo.packagist.org/p';
  }

  getDependencyProperties() {
    return this.getContribution(
      ComposerContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.getContribution(
      ComposerContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}
