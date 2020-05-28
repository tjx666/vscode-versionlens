// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core.logging';
import { RequestFactory } from 'core.packages';

import { VersionLensFetchResponse } from 'presentation.providers';

import { NpmVersionLensProvider } from 'infrastructure.providers/npm';

import { extractPackageDependenciesFromJson } from './jspmPackageParser';
import { JspmConfig } from './jspmConfig';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(config: JspmConfig, logger: ILogger) {
    super(config, logger);
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDependencies = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.dependencyProperties,
    );
    if (packageDependencies.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      includePrereleases,
      clientData: null,
    }

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.packageClient,
      packageDependencies,
      context,
    );
  }

}