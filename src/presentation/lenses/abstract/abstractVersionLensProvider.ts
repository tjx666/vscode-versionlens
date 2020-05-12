// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appSettings from 'appSettings';
import { PackageSourceTypes } from 'core/packages/models/packageDocument';
import { PackageResponseErrors } from 'core/packages/models/packageResponse';
import * as CommandFactory from 'presentation/commands/factory';
import { IVersionCodeLens } from "../definitions/IVersionCodeLens";
import { VersionLens } from '../models/versionLens';

export type VersionLensFetchResponse = Promise<VersionLens[] | null>;

export abstract class AbstractVersionLensProvider {

  _onChangeCodeLensesEmitter: VsCodeTypes.EventEmitter<void>;

  onDidChangeCodeLenses: any;

  abstract updateOutdated(packagePath: string);

  abstract fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse;

  constructor() {
    const { EventEmitter } = require('vscode');
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

    const { dirname } = require('path');
    const packagePath = dirname(document.uri.fsPath);

    // set in progress
    appSettings.inProgress = true;

    return this.fetchVersionLenses(packagePath, document, token);
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