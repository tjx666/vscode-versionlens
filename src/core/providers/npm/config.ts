enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

export default new class {

  provider: string;

  defaultDependencyProperties: Array<string>;

  constructor() {
    this.provider = 'npm';

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