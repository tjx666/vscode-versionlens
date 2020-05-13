import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

enum PubContributions {
  DependencyProperties = 'pub.dependencyProperties',
  ApiUrl = 'pub.apiUrl',
}

const options = {
  pattern: "**/pubspec.yaml",
  group: [],
  selector: {
    language: "yaml",
    scheme: "file",
  }
}

export default new class extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor() {
    super('pub', options);

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