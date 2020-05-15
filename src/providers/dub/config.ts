import * as VsCodeTypes from "vscode";

import { AbstractProviderConfig } from "presentation/providers";
import { IProviderOptions, PackageFileFilter } from "core/packages";

enum DubContributions {
  DependencyProperties = 'dub.dependencyProperties',
  ApiUrl = 'dub.apiUrl',
}

const options = {
  name: 'dub',
  group: ['statuses'],
  selector: {
    language: 'json',
    scheme: 'file',
    pattern: '**/{dub.json,dub.selections.json}',
  }
};

export class DubConfig
  extends AbstractProviderConfig
  implements IProviderOptions {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration);

    this.defaultDependencyProperties = [
      'dependencies',
      'versions'
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
      DubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.get(
      DubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}