// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { VersionLensFactory } from 'presentation/lenses';
import { VersionLensFetchResponse } from 'presentation/providers';

import { NpmVersionLensProvider } from 'providers/npm/npmProvider';
import { npmReplaceVersion } from 'providers/npm/npmVersionUtils';

import { extractPackageDependenciesFromJson } from './jspmPackageParser';
import { JspmConfig } from './jspmConfig';
import { ILogger } from 'core/logging';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(config: JspmConfig, logger: ILogger) {
    super(config, logger);
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const jspmDependencyLenses = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.dependencyProperties,
    );
    if (jspmDependencyLenses.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    // defrost cache settings
    this.config.caching.defrost();

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