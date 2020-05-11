import { EventEmitter, CancellationToken } from 'vscode';
import appSettings from '../../../appSettings';
import { PackageSourceTypes } from 'core/packages/models/packageDocument';
import * as CommandFactory from 'presentation/commands/factory';
import { IVersionCodeLens } from "./IVersionCodeLens";
import { VersionLens } from '../models/versionLens';
import { PackageErrors } from '../models/packageLens';

export abstract class AbstractCodeLensProvider {

  _onChangeCodeLensesEmitter: EventEmitter<void>;

  onDidChangeCodeLenses: any;

  constructor() {
    const { EventEmitter } = require('vscode');
    this._onChangeCodeLensesEmitter = new EventEmitter();
    this.onDidChangeCodeLenses = this._onChangeCodeLensesEmitter.event;
  }

  reload() {
    this._onChangeCodeLensesEmitter.fire();
  }

  resolveCodeLens(codeLens: IVersionCodeLens, token: CancellationToken) {
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

  evaluateCodeLens(codeLens: IVersionCodeLens, token: CancellationToken) {
    // if (codeLens.isMetaType('github'))
    //   return CommandFactory.createGithubCommand(codeLens);

    if (codeLens.hasPackageError(PackageErrors.Unexpected))
      return CommandFactory.createPackageUnexpectedError(codeLens);

    if (codeLens.hasPackageError(PackageErrors.NotFound))
      return CommandFactory.createPackageNotFoundCommand(codeLens);

    if (codeLens.hasPackageError(PackageErrors.NotSupported))
      return CommandFactory.createPackageMessageCommand(codeLens);

    if (codeLens.hasPackageError(PackageErrors.GitNotFound))
      return CommandFactory.createPackageMessageCommand(codeLens);

    if (codeLens.hasPackageSource(PackageSourceTypes.directory))
      return CommandFactory.createDirectoryLinkCommand(codeLens);

    // generate decoration
    // if (appSettings.showDependencyStatuses) this.generateDecoration(codeLens);

    return CommandFactory.createTaggedVersionCommand(codeLens)
  }


}