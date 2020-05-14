import * as VsCodeTypes from "vscode";

import { AbstractProviderConfig } from 'presentation/providers';

enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

const options = {
  group: ['tags', 'statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/package.json',
  }
}

export class NpmConfig extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration, provider: string = 'npm') {
    super(provider, configuration, options);

    this.defaultDependencyProperties = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
  }

  getDependencyProperties() {
    return this.getSetting(
      NpmContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getDistTagFilter() {
    return this.getSetting(
      NpmContributions.DistTagFilter,
      []
    );

  }

}
