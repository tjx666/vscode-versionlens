import * as VsCodeTypes from "vscode";

export type ProviderOptions = {
  group: Array<String>;
  selector: VsCodeTypes.DocumentFilter;
};

export interface IProviderConfig {
  options: ProviderOptions;
  provider: string;
  matchesFilename: (filename: string) => boolean;
  getContribution: (key: string, defaultValue: any) => any;
}