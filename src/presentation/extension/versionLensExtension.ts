import { IFrozenRespository } from "core/generic/repositories";
import { LoggingOptions } from "core/logging";
import { CachingOptions, ICachingOptions } from "core/clients";

import { VersionLensState } from "presentation/extension";

import { SuggestionsOptions } from "./options/suggestionsOptions";
import { StatusesOptions } from "./options/statusesOptions";

export enum SuggestionIndicators {
  Update = '\u2191',
  Revert = '\u2193',
  OpenNewWindow = '\u29C9',
}

export class VersionLensExtension {

  static extensionName: string = 'VersionLens';

  config: IFrozenRespository;

  logging: LoggingOptions;

  caching: ICachingOptions;

  suggestions: SuggestionsOptions;

  statuses: StatusesOptions;

  state: VersionLensState;

  constructor(config: IFrozenRespository) {
    this.config = config;

    // instantiate contrib options
    this.logging = new LoggingOptions(config, 'logging');
    this.caching = new CachingOptions(config, 'caching');

    this.suggestions = new SuggestionsOptions(config);
    this.statuses = new StatusesOptions(config);

    // instantiate setContext options
    this.state = new VersionLensState(this);
  }

}

let _extensionSingleton = null;
export default _extensionSingleton;

export function registerExtension(config: IFrozenRespository): VersionLensExtension {
  _extensionSingleton = new VersionLensExtension(config);
  return _extensionSingleton;
}