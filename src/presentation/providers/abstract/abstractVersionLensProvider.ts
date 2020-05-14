// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appSettings from 'appSettings';
import { ILogger } from 'core/logging/definitions';
import { IProviderConfig } from "core/configuration/definitions";
import { PackageSourceTypes, PackageResponseErrors } from 'core/packages';
import * as CommandFactory from 'presentation/commands/factory';
import { IVersionCodeLens, VersionLens } from "presentation/lenses";

export type VersionLensFetchResponse = Promise<VersionLens[] | null>;

export abstract class AbstractVersionLensProvider {

  _onChangeCodeLensesEmitter: VsCodeTypes.EventEmitter<void>;

  onDidChangeCodeLenses: any;

  config: IProviderConfig;

  // packagePath: string;
  logger: ILogger;

  abstract updateOutdated(packagePath: string): Promise<any>;

  // abstract generateDecorations(versionLens: VersionLens);

  abstract fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse;

  constructor(config: IProviderConfig) {
    const { EventEmitter } = require('vscode');
    this.config = config;
    this._onChangeCodeLensesEmitter = new EventEmitter();
    this.onDidChangeCodeLenses = this._onChangeCodeLensesEmitter.event;
  }

  reload() {
    this._onChangeCodeLensesEmitter.fire();
  }

  async provideCodeLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): Promise<VersionLens[] | null> {
    if (appSettings.showVersionLenses === false) return null;
    const { window } = require('vscode');

    // set in progress
    appSettings.inProgress = true;

    if (!this.logger) {
      this.logger = window.createOutputChannel(
        `versionlens - ${this.config.provider}`
      );
    }

    const outputChannel: any = this.logger;
    outputChannel.clear();

    return this.fetchVersionLenses(document, token);
  }

  async resolveCodeLens(
    codeLens: IVersionCodeLens,
    token: VsCodeTypes.CancellationToken
  ): Promise<VersionLens> {
    if (codeLens instanceof VersionLens) {
      // set in progress
      appSettings.inProgress = true;

      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens, token);

      // update the progress
      return Promise.resolve(evaluated)
        .then(result => {
          appSettings.inProgress = false;
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