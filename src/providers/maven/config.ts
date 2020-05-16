import * as VsCodeTypes from "vscode";

import { AbstractWorkspaceConfig } from "presentation/configuration";
import { PackageFileFilter, IPackageProviderOptions } from "core/packages";

enum MavenContributions {
  DependencyProperties = 'maven.dependencyProperties',
  TagFilter = 'maven.tagFilter',
  ApiUrl = 'maven.apiUrl',
}

const options = {
  name: 'maven',
  group: ['tags'],
  selector: {
    language: 'xml',
    scheme: 'file',
    pattern: '**/pom.xml',
  }
}

export class MavenConfig
  extends AbstractWorkspaceConfig
  implements IPackageProviderOptions {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration)

    this.defaultDependencyProperties = [
      'dependency',
      'parent'
    ];

    this.defaultApiUrl = 'https://code.dlang.org/api/packages';
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
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getTagFilter() {
    return this.get(
      MavenContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.get(
      MavenContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}