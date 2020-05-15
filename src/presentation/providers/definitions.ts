import * as VsCodeTypes from "vscode";

import { IConfig } from "core/configuration";
import { VersionLens } from "presentation/lenses";

export interface IProviderConfig extends IConfig {

  configuration: VsCodeTypes.WorkspaceConfiguration;

}

export type VersionLensFetchResponse = Promise<VersionLens[] | null>;