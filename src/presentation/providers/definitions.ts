import * as VsCodeTypes from "vscode";
import { VersionLens } from "presentation/lenses";

export type ProviderOptions = {
  group: Array<String>;
  selector: VsCodeTypes.DocumentFilter;
};

export interface IProviderConfig {
  provider: string,
  configuration: VsCodeTypes.WorkspaceConfiguration,
  options: ProviderOptions;
  matchesFilename: (filename: string) => boolean;
  getSetting: (key: string, defaultValue: any) => any;
}

export type VersionLensFetchResponse = Promise<VersionLens[] | null>;