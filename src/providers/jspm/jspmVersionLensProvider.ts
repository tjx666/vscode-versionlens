// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { VersionLensFactory } from 'presentation/lenses';
import { VersionLensFetchResponse } from 'presentation/providers';
import { NpmVersionLensProvider } from 'providers/npm/npmVersionLensProvider';
import { extractPackageDependenciesFromJson } from './jspmPackageParser';
import { npmReplaceVersion } from 'providers/npm/npmVersionUtils';
import { JspmConfig } from './config';
import { PacoteClient } from 'providers/npm/clients/pacoteClient';
import { ILogger } from 'core/generic/logging';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(
    pacoteClient: PacoteClient,
    config: JspmConfig,
    logger: ILogger
  ) {
    super(pacoteClient, config, logger);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const jspmDependencyLenses = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.getDependencyProperties(),
    );
    if (jspmDependencyLenses.length === 0) return null;

    const context = {
      providerName: this.config.providerName,
      client: this.pacoteClient,
      clientData: this.config,
      logger: this.logger,
      replaceVersion: npmReplaceVersion,
    }

    // fetch from npm
    return VersionLensFactory.createVersionLenses(
      document,
      jspmDependencyLenses,
      context,
    );
  }

}