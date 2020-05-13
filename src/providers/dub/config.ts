import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

enum DubContributions {
  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
}

const options = {
  pattern: '**/{dub.json,dub.selections.json}',
  group: ['statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
  }
};

export default new class extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor() {
    super('dub', options);

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