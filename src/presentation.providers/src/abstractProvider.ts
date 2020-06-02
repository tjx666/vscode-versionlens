import { EventEmitter, TextDocument, CancellationToken } from 'vscode';

import { ILogger } from 'core.logging';
import { IProviderConfig } from 'core.providers';
import {
  PackageSourceTypes,
  PackageResponseErrors,
  PackageResponse,
  ReplaceVersionFunction
} from 'core.packages';

import {
  CommandFactory,
  IVersionCodeLens,
  VersionLens,
  VersionLensFactory
} from "presentation.lenses";
import { VersionLensExtension } from 'presentation.extension';

import { defaultReplaceFn } from './providerUtils';

export type VersionLensFetchResponse = Promise<Array<PackageResponse>>;

export abstract class AbstractVersionLensProvider<TConfig extends IProviderConfig> {

  _onChangeCodeLensesEmitter: EventEmitter<void>;

  onDidChangeCodeLenses: any;

  config: TConfig;

  logger: ILogger;

  extension: VersionLensExtension;

  customReplaceFn: ReplaceVersionFunction;

  abstract fetchVersionLenses(
    packagePath: string, document: TextDocument
  ): VersionLensFetchResponse;

  constructor(extension: VersionLensExtension, config: TConfig, logger: ILogger) {
    this.extension = extension;
    this.config = config;
    this._onChangeCodeLensesEmitter = new EventEmitter();
    this.onDidChangeCodeLenses = this._onChangeCodeLensesEmitter.event;
    this.logger = logger;
  }

  refreshCodeLenses() {
    this._onChangeCodeLensesEmitter.fire();
  }

  async provideCodeLenses(
    document: TextDocument, token: CancellationToken
  ): Promise<VersionLens[] | null> {
    if (this.extension.state.enabled.value === false) return null;

    // package path
    const { dirname } = require('path');
    const packagePath = dirname(document.uri.fsPath);

    // clear any errors
    this.extension.state.providerError.value = false;

    // set in progress
    this.extension.state.providerBusy.value++;

    this.logger.info("Analysing dependencies for %s", document.uri.fsPath);

    // unfreeze config per file request
    this.config.caching.defrost();

    this.logger.debug(
      "Caching duration is set to %s milliseconds",
      this.config.caching.duration
    );

    return this.fetchVersionLenses(packagePath, document)
      .then(responses => {
        this.extension.state.providerBusy.value--;
        if (responses === null) {
          this.logger.info("No dependencies found in %s", document.uri.fsPath)
          return null;
        }

        this.logger.info("Resolved %s dependencies", responses.length)

        return VersionLensFactory.createFromPackageResponses(
          document,
          responses,
          this.customReplaceFn || defaultReplaceFn
        );
      })
      .catch(error => {
        this.extension.state.providerError.value = true;
        this.extension.state.providerBusy.change(0)
        return Promise.reject(error);
      })
  }

  async resolveCodeLens(
    codeLens: IVersionCodeLens, token: CancellationToken
  ): Promise<VersionLens> {
    if (codeLens instanceof VersionLens) {
      // evaluate the code lens
      const evaluated = this.evaluateCodeLens(codeLens, token);

      // update the progress
      return Promise.resolve(evaluated);
    }
  }

  evaluateCodeLens(codeLens: IVersionCodeLens, token: CancellationToken) {
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

    return CommandFactory.createSuggestedVersionCommand(codeLens)
  }

}