import * as VsCodeTypes from 'vscode';

import { ILogger, LoggingOptions } from 'core.logging';
import { HttpOptions, CachingOptions } from 'core.clients';

import { VsCodeConfig } from 'infrastructure.configuration';
import { IVsCodeWorkspace } from 'infrastructure.configuration';

import {
  VersionLensExtension,
  TextEditorEvents,
  IconCommands,
  SuggestionCommands
} from 'presentation.extension';

import { ProviderRegistry } from 'presentation.providers';

export interface IContainerMap {

  // vscode abstractions
  vscodeWorkspace: IVsCodeWorkspace,

  // configuration
  rootConfig: VsCodeConfig,

  // logging
  outputChannel: VsCodeTypes.OutputChannel,
  logger: ILogger,

  // logging options
  loggingOptions: LoggingOptions,
  httpOptions: HttpOptions,
  cachingOptions: CachingOptions,

  // extension
  extensionName: string,
  extension: VersionLensExtension,

  // commands
  subscriptions: Array<VsCodeTypes.Disposable>,
  iconCommands: IconCommands,
  suggestionCommands: SuggestionCommands,

  // events
  textEditorEvents: TextEditorEvents,

  // providers
  providerRegistry: ProviderRegistry
}