// vscode references
import * as VsCodeTypes from 'vscode';

import { IFrozenRepository } from 'core.generics';
import { LoggingOptions, ILoggingOptions } from 'core.logging';
import {
  CachingOptions,
  ICachingOptions,
  HttpOptions,
  IHttpOptions
} from 'core.clients';

import { VersionLensState } from "presentation.extension";

import { SuggestionsOptions } from "./options/suggestionsOptions";
import { StatusesOptions } from "./options/statusesOptions";

export enum SuggestionIndicators {
  Update = '\u2191',
  Revert = '\u2193',
  OpenNewWindow = '\u29C9',
}

export class VersionLensExtension {

  static extensionName: string = 'VersionLens';

  config: IFrozenRepository;

  logging: ILoggingOptions;

  caching: ICachingOptions;

  http: IHttpOptions;

  suggestions: SuggestionsOptions;

  statuses: StatusesOptions;

  state: VersionLensState;

  outputChannel: VsCodeTypes.OutputChannel;

  constructor(config: IFrozenRepository, outputChannel: VsCodeTypes.OutputChannel) {
    this.config = config;

    // instantiate contrib options
    this.logging = new LoggingOptions(config, 'logging');
    this.caching = new CachingOptions(config, 'caching');
    this.http = new HttpOptions(config, 'http');

    this.suggestions = new SuggestionsOptions(config);
    this.statuses = new StatusesOptions(config);

    // instantiate setContext options
    this.state = new VersionLensState(this);

    this.outputChannel = outputChannel;
  }

}

let _extensionSingleton = null;
export default _extensionSingleton;

export function registerExtension(
  config: IFrozenRepository, outputChannel: VsCodeTypes.OutputChannel
): VersionLensExtension {
  _extensionSingleton = new VersionLensExtension(config, outputChannel);
  return _extensionSingleton;
}