// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { getExtension, VersionLensExtension } from 'presentation/extension';
import { ILogger } from 'core/logging';

import {
  PackageSourceTypes,
  PackageResponseErrors,
  IPackageProviderOptions
} from 'core/packages';

import * as CommandFactory from 'presentation/commands/factory';

import { IVersionCodeLens } from "../definitions/iVersionCodeLens";
import { VersionLens } from "../models/versionLens";

export type VersionLensFetchResponse = Promise<VersionLens[] | null>;

export abstract class AbstractVersionLensProvider<TConfig extends IPackageProviderOptions> {

  _onChangeCodeLensesEmitter: VsCodeTypes.EventEmitter<void>;

  onDidChangeCodeLenses: any;

  config: TConfig;

  // packagePath: string;
  logger: ILogger;

  extension: VersionLensExtension;

  abstract updateOutdated(packagePath: string): Promise<any>;

  // abstract generateDecorations(versionLens: VersionLens);

  abstract fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse;

  constructor(
    config: TConfig,
    logger: ILogger
  ) {
    const { EventEmitter } = require('vscode');
    this.config = config;
    this._onChangeCodeLensesEmitter = new EventEmitter();
    this.onDidChangeCodeLenses = this._onChangeCodeLensesEmitter.event;
    this.logger = logger;

    // todo add to constructor
    this.extension = getExtension();
  }

  reload() {
    this._onChangeCodeLensesEmitter.fire();
  }

  async provideCodeLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): Promise<VersionLens[] | null> {
    if (this.extension.state.enabled.value === false) return null;


    // package path (todo abstract this)
    const { dirname } = require('path');
    const packagePath = dirname(document.uri.fsPath);

    // set in progress
    this.extension.state.providerBusy.value = true;

    // todo clear output channel
    // if (this.logger){
    //    this.logger.clear()
    // }

    return this.fetchVersionLenses(packagePath, document, token);
  }

  async resolveCodeLens(
    codeLens: IVersionCodeLens,
    token: VsCodeTypes.CancellationToken
  ): Promise<VersionLens> {
    if (codeLens instanceof VersionLens) {
      // set in progress
      this.extension.state.providerBusy.value = true;

      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens, token);

      // update the progress
      return Promise.resolve(evaluated)
        .then(result => {
          this.extension.state.providerBusy.value = false;
          return result;
        })
    }
  }

  evaluateCodeLens(
    codeLens: IVersionCodeLens,
    token: VsCodeTypes.CancellationToken
  ) {
    // if (codeLens.isMetaType('github'))
    //   return CommandFactory.createGithubCommand(codeLens);

    if (codeLens.hasPackageError(PackageResponseErrors.Unexpected))
      return CommandFactory.createPackageUnexpectedError(codeLens);

    if (codeLens.hasPackageError(PackageResponseErrors.NotFound))
      return CommandFactory.createPackageNotFoundCommand(codeLens);

    if (codeLens.hasPackageError(PackageResponseErrors.NotSupported))
      return CommandFactory.createPackageMessageCommand(codeLens);

    if (codeLens.hasPackageError(PackageResponseErrors.GitNotFound))
      return CommandFactory.createPackageMessageCommand(codeLens);

    if (codeLens.hasPackageSource(PackageSourceTypes.Directory))
      return CommandFactory.createDirectoryLinkCommand(codeLens);

    // generate decoration
    // if (appSettings.showDependencyStatuses) this.generateDecoration(codeLens);

    return CommandFactory.createSuggestedVersionCommand(codeLens)
  }

}