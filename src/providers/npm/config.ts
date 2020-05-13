import { AbstractProviderConfig } from 'core/configuration/abstractProviderConfig';

enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

const options = {
  pattern: '**/package.json',
  group: ['tags', 'statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
  }
}

export class NpmConfig extends AbstractProviderConfig {

  defaultDependencyProperties: Array<string>;

  constructor(provider: string = 'npm') {
    super(provider, options);

    this.defaultDependencyProperties = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
  }

  getDependencyProperties() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(NpmContributions.DependencyProperties, this.defaultDependencyProperties);
  }

  getDistTagFilter() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get(NpmContributions.DistTagFilter, []);
  }

}

export default new NpmConfig();