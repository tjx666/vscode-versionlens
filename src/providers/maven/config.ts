import * as VsCodeTypes from "vscode";

import { AbstractProviderConfig } from "presentation/providers";

enum MavenContributions {
  DependencyProperties = 'maven.dependencyProperties',
  TagFilter = 'maven.tagFilter',
  ApiUrl = 'maven.apiUrl',
}

const options = {
  group: ['tags'],
  selector: {
    language: 'xml',
    scheme: 'file',
    pattern: '**/pom.xml',
  }
}

export class MavenConfig extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super('maven', configuration, options)

    this.defaultDependencyProperties = [
      'dependency',
      'parent'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
  }

  getDependencyProperties() {
    return this.getSetting(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.getSetting(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.getSetting(
      MavenContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}