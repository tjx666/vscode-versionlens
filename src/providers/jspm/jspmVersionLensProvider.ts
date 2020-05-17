// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import {
  VersionLensFactory,
  VersionLensFetchResponse
} from 'presentation/lenses';

import { NpmConfig } from 'providers/npm/config';
import { NpmVersionLensProvider } from 'providers/npm/npmVersionLensProvider';
import { npmReplaceVersion } from 'providers/npm/npmVersionUtils';

import { extractPackageDependenciesFromJson } from './jspmPackageParser';
import { JspmConfig } from './config';
import { ILogger } from 'core/logging';
import { IPackageClient } from 'core/packages';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(
    packageClient: IPackageClient<NpmConfig>,
    config: JspmConfig,
    logger: ILogger
  ) {
    super(packageClient, config, logger);
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

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      providerName: this.config.providerName,
      includePrereleases,
      client: this.packageClient,
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