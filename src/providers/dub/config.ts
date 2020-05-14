import { AbstractProviderConfig } from "core/configuration/abstractProviderConfig";

enum DubContributions {
  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
}

const options = {
  group: ['statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/{dub.json,dub.selections.json}',
  }
};

export class DubConfig extends AbstractProviderConfig {

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
    return this.getContribution(
      DubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.getContribution(
      DubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}