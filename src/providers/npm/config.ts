import * as VsCodeTypes from "vscode";

import { AbstractProviderConfig } from 'presentation/providers';
import { PackageFileFilter, IPackageProviderOptions } from "core/packages";

enum NpmContributions {
  DependencyProperties = 'npm.dependencyProperties',
  DistTagFilter = 'npm.distTagFilter',
}

const options = {
  name: 'npm',
  group: ['tags', 'statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/package.json',
  }
}

export class NpmConfig
  extends AbstractProviderConfig
  implements IPackageProviderOptions {

  defaultDependencyProperties: Array<string>;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration);

    this.defaultDependencyProperties = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
  }

  get providerName(): string {
    return options.name;
  }

  get group(): Array<string> {
    return options.group;
  }

  get selector(): PackageFileFilter {
    return options.selector;
  }


  getDependencyProperties() {
    return this.get(
      NpmContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getDistTagFilter() {
    return this.get(
      NpmContributions.DistTagFilter,
      []
    );

  }

}
