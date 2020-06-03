import { OutputChannel, Disposable } from 'vscode';

import { ILogger, LoggingOptions } from 'core.logging';
import { HttpOptions, CachingOptions } from 'core.clients';

import { VsCodeConfig } from 'infrastructure.configuration';

import {
  VersionLensExtension,
  TextEditorEvents,
  IconCommands,
  SuggestionCommands
} from 'presentation.extension';

import { ProviderRegistry } from 'presentation.providers';
import { ILoggerTransport } from 'infrastructure.logging';

export interface IContainerMap {

  extensionName: string,

  // configuration
  rootConfig: VsCodeConfig,

  // logging options
  loggingOptions: LoggingOptions,

  httpOptions: HttpOptions,

  cachingOptions: CachingOptions,

  // logging
  outputChannel: OutputChannel,

  outputChannelTransport: ILoggerTransport,

  logger: ILogger,

  // extension
  extension: VersionLensExtension,

  // commands
  subscriptions: Array<Disposable>,

  iconCommands: IconCommands,

  suggestionCommands: SuggestionCommands,

  // events
  textEditorEvents: TextEditorEvents,

  // providers
  providerRegistry: ProviderRegistry
}