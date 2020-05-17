import { AbstractWorkspaceConfig, IConfig, IRootConfig } from "core/configuration";
import { VersionLensState } from "presentation/extension";
import { LoggingOptions } from "./options/loggingOptions";
import { SuggestionsOptions } from "./options/suggestionsOptions";
import { StatusesOptions } from "./options/statusesOptions";

export enum SuggestionIndicators {
  Update = '\u2191',
  Revert = '\u2193',
  OpenNewWindow = '\u29C9',
}

export class VersionLensExtension extends AbstractWorkspaceConfig {

  extensionName: string;

  state: VersionLensState;

  logging: LoggingOptions;

  suggestions: SuggestionsOptions;

  statuses: StatusesOptions;

  constructor(config: IRootConfig) {
    super(<IConfig>config);

    this.extensionName = "versionlens";

    // instantiate contrib options
    this.logging = new LoggingOptions(this);
    this.suggestions = new SuggestionsOptions(this);
    this.statuses = new StatusesOptions(this);

    // instantiate setContext options
    this.state = new VersionLensState(this);
  }

}

let _extensionSingleton = null;
export default _extensionSingleton;

export function registerExtension(config: IRootConfig): VersionLensExtension {
  _extensionSingleton = new VersionLensExtension(config);
  return _extensionSingleton;
}