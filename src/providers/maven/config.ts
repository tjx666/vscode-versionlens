import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

enum MavenContributions {
  DependencyProperties = 'maven.dependencyProperties',
  TagFilter = 'maven.tagFilter',
  ApiUrl = 'maven.apiUrl',
}

const options = {
  pattern: '**/pom.xml',
  group: ['tags'],
  selector: {
    language: 'xml',
    scheme: 'file',
  }
}

export default new class extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor() {
    super('maven', options)

    this.defaultDependencyProperties = [
      'dependency',
      'parent'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
  }

  getDependencyProperties() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(MavenContributions.TagFilter, []);
  }

  getApiUrl() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(MavenContributions.ApiUrl, this.defaultApiUrl);
  }

}