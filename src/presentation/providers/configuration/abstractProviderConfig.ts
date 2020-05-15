import * as VsCodeTypes from "vscode";

import { IProviderConfig } from "../definitions";

export class AbstractProviderConfig implements IProviderConfig {

  configuration: VsCodeTypes.WorkspaceConfiguration;

  constructor(configuration: VsCodeTypes.WorkspaceConfiguration) {
    this.configuration = configuration;
  }

  get<T>(key: string, defaultValue: T): T {
    return this.configuration.get(key, defaultValue);
  }

}