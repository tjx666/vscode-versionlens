enum DubContributions {
  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
}

export default new class {

  provider: string;

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor() {
    this.provider = 'dub';

    this.defaultDependencyProperties = [
      'dependencies',
      'versions'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
  }

  getDependencyProperties() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(
      DubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(DubContributions.ApiUrl, this.defaultApiUrl);
  }

}