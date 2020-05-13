// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appSettings from 'appSettings';
import { PackageSourceTypes } from 'core/packages/models/packageDocument';
import { PackageResponseErrors } from 'core/packages/models/packageResponse';
import * as CommandFactory from 'presentation/commands/factory';
import { IVersionCodeLens } from "../../lenses/definitions/IVersionCodeLens";
import { VersionLens } from '../../lenses/models/versionLens';
import { ILogger } from 'core/logging/definitions';

export type VersionLensFetchResponse = Promise<VersionLens[] | null>;

export abstract class AbstractVersionLensProvider {

  _onChangeCodeLensesEmitter: VsCodeTypes.EventEmitter<void>;

  onDidChangeCodeLenses: any;

  provider: string;

  // packagePath: string;
  logger: ILogger;

  abstract updateOutdated(packagePath: string);

  abstract fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse;

  constructor(provider: string) {
    const { EventEmitter } = require('vscode');
    this.provider = provider;
    this._onChangeCodeLensesEmitter = new EventEmitter();
    this.onDidChangeCodeLenses = this._onChangeCodeLensesEmitter.event;
  }

  reload() {
    this._onChangeCodeLensesEmitter.fire();
  }

  provideCodeLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): Promise<VersionLens[] | null> {
    if (appSettings.showVersionLenses === false) return null;
    const { window } = require('vscode');

    // set in progress
    appSettings.inProgress = true;

    if (!this.logger) {
      this.logger = window.createOutputChannel(`versionlens - ${this.provider}`);
    }

    const outputChannel: any = this.logger;
    outputChannel.clear();

    return this.fetchVersionLenses(document, token);
  }

  resolveCodeLens(codeLens: IVersionCodeLens, token: VsCodeTypes.CancellationToken) {
    if (codeLens instanceof VersionLens) {
      // set in progress
      appSettings.inProgress = true;

      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens, token);

      // update the progress
      if (evaluated instanceof Promise) {
        evaluated.then(result => {
          appSettings.inProgress = false;
          return result;
        })
      } else
        appSettings.inProgress = false;

      // return evaluated codelens
      return evaluated;
    }
  }

  evaluateCodeLens(codeLens: IVersionCodeLens, token: VsCodeTypes.CancellationToken) {
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