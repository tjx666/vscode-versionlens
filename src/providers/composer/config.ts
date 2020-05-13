import { AbstractProviderConfig } from 'core/configuration/abstractProviderConfig';

enum ComposerContributions {
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
}

const options = {
  pattern: '**/composer.json',
  group: ['tags'],
  selector: {
    language: 'json',
    scheme: 'file'
  }
}

export default new class extends AbstractProviderConfig {

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
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(
      ComposerContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(ComposerContributions.ApiUrl, this.defaultApiUrl);
  }

}