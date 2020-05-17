// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { VersionLensFactory } from 'presentation/lenses';
import { VersionLensFetchResponse } from 'presentation/providers';

import { NpmVersionLensProvider } from 'providers/npm/npmVersionLensProvider';
import { npmReplaceVersion } from 'providers/npm/npmVersionUtils';

import { extractPackageDependenciesFromJson } from './jspmPackageParser';
import { JspmConfig } from './config';
import { ILogger } from 'core/logging';
import { IPackageClient } from 'core/packages';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(
    packageClient: IPackageClient<null>,
    config: JspmConfig,
    logger: ILogger
  ) {
    super(packageClient, config, logger);
  }

  async fetchVersionLenses(
    packagePath: string,
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
      includePrereleases,
      clientData: null,
      replaceVersion: npmReplaceVersion,
    }

    // fetch from npm
    return VersionLensFactory.createVersionLenses(
      this.packageClient,
      document,
      jspmDependencyLenses,
      context,
    );
  }

}