import * as VsCodeTypes from "vscode";

import { IConfig } from "core/configuration";

export class AbstractWorkspaceConfig implements IConfig {

  configuration: VsCodeTypes.WorkspaceConfiguration;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    this.configuration = configuration;
  }

  get<T>(key: string, defaultValue: T): T {
    return this.configuration.get(key, defaultValue);
  }

}