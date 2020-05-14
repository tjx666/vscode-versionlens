import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

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

  constructor() {
    super('maven', options)

    this.defaultDependencyProperties = [
      'dependency',
      'parent'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
  }

  getDependencyProperties() {
    return this.getContribution(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.getContribution(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.getContribution(
      MavenContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}