enum PubContributions {
  DependencyProperties = 'pub.dependencyProperties',
  ApiUrl = 'pub.apiUrl',
}

export default new class {

  provider: string;

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor() {
    this.provider = 'pub';

    this.defaultDependencyProperties = [
      'dependencies',
      'dev_dependencies'
    ];

    this.defaultApiUrl = 'https://pub.dev/';
  }

  getDependencyProperties() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(PubContributions.DependencyProperties, this.defaultDependencyProperties);
  }

  getApiUrl() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(PubContributions.ApiUrl, this.defaultApiUrl);
  }

}