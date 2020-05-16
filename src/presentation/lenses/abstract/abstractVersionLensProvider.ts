// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { getEditor, Editor } from 'presentation/editor/editor';
import { ILogger } from 'core/generic/logging';

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
  editor: Editor;

  abstract updateOutdated(packagePath: string): Promise<any>;

  // abstract generateDecorations(versionLens: VersionLens);

  abstract fetchVersionLenses(
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
    this.editor = getEditor();
  }

  reload() {
    this._onChangeCodeLensesEmitter.fire();
  }

  async provideCodeLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): Promise<VersionLens[] | null> {
    if (this.editor.palette.enabled.value === false) return null;

    // set in progress
    this.editor.palette.providerBusy.value = true;

    // todo clear output channel
    // if (this.logger){
    //    this.logger.clear()
    // }

    return this.fetchVersionLenses(document, token);
  }

  async resolveCodeLens(
    codeLens: IVersionCodeLens,
    token: VsCodeTypes.CancellationToken
  ): Promise<VersionLens> {
    if (codeLens instanceof VersionLens) {
      // set in progress
      this.editor.palette.providerBusy.value = true;

      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens, token);

      // update the progress
      return Promise.resolve(evaluated)
        .then(result => {
          this.editor.palette.providerBusy.value = false;
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

    if (codeLens.hasPackageSource(PackageSourceTypes.directory))
      return CommandFactory.createDirectoryLinkCommand(codeLens);

    // generate decoration
    // if (appSettings.showDependencyStatuses) this.generateDecoration(codeLens);

    return CommandFactory.createSuggestedVersionCommand(codeLens)
  }

}