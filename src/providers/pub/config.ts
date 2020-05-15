import * as VsCodeTypes from "vscode";

import { AbstractProviderConfig } from "presentation/providers";
import { PackageFileFilter, IProviderOptions } from "core/packages";

enum PubContributions {
  DependencyProperties = 'pub.dependencyProperties',
  ApiUrl = 'pub.apiUrl',
}

const options = {
  name: 'pub',
  group: [],
  selector: {
    language: "yaml",
    scheme: "file",
    pattern: "**/pubspec.yaml",
  }
}

export class PubConfig
  extends AbstractProviderConfig
  implements IProviderOptions {

  defaultDependencyProperties: Array<string>;

  defaultApiUrl: string;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    super(configuration);

    this.defaultDependencyProperties = [
      'dependencies',
      'dev_dependencies'
    ];

    this.defaultApiUrl = 'https://pub.dev/';
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
      PubContributions.DependencyProperties,
      this.defaultDependencyProperties
    );
  }

  getApiUrl() {
    return this.get(
      PubContributions.ApiUrl,
      this.defaultApiUrl
    );
  }

}