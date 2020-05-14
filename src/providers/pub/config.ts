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

export class PubConfig extends AbstractProviderConfig {

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
    return this.getContribution(
      PubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {

    return this.getContribution(
      PubContributions.ApiUrl,
      this.defaultApiUrl
    );

  }

}