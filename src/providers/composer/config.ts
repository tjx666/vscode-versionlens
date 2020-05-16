import * as VsCodeTypes from "vscode";

import { IPackageProviderOptions, PackageFileFilter } from "core/packages";
import { AbstractWorkspaceConfig } from 'presentation/configuration';

enum ComposerContributions {
  DependencyProperties = 'composer.dependencyProperties',
  ApiUrl = 'composer.apiUrl',
}

const options = {
  name: 'composer',
  group: ['tags'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/composer.json',
  }
}

export class ComposerConfig
  extends AbstractWorkspaceConfig
  implements IPackageProviderOptions {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration);

    this.defaultDependencyProperties = [
      "require",
      "require-dev"
    ];

    this.defaultApiUrl = 'https://repo.packagist.org/p';
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
      ComposerContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.get(
      ComposerContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}
