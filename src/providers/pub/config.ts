import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

enum PubContributions {
  DependencyProperties = 'pub.dependencyProperties',
  ApiUrl = 'pub.apiUrl',
}

const options = {
  group: [],
  selector: {
    language: "yaml",
    scheme: "file",
    pattern: "**/pubspec.yaml",
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