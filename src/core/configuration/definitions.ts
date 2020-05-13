import * as VsCodeTypes from "vscode";

export type ProviderOptions = {
  pattern: string;
  group: Array<String>;
  selector: VsCodeTypes.DocumentSelector;
};

export interface IProviderConfig {
  options: ProviderOptions;
  provider: string;
  matchesFilename: (filename: string) => boolean;
}