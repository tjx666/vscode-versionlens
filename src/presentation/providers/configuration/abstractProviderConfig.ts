import * as VsCodeTypes from "vscode";

import { IProviderConfig, ProviderOptions } from "../definitions";

export class AbstractProviderConfig implements IProviderConfig {

  provider: string;

  configuration: VsCodeTypes.WorkspaceConfiguration;

  options: ProviderOptions;

  constructor(provider: string, configuration: VsCodeTypes.WorkspaceConfiguration, options: ProviderOptions) {
    this.provider = provider;
    this.configuration = configuration;
    this.options = options;
  }

  matchesFilename(filename: string): boolean {
    const minimatch = require('minimatch');
    return minimatch(filename, this.options.selector.pattern);
  }

  getSetting(key: string, defaultValue: any): any {
    return this.configuration.get(key, defaultValue);
  }

}