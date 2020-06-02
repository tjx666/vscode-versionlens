// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core.logging';
import { RequestFactory, IPackageClient } from 'core.packages';

import { VersionLensFetchResponse } from 'presentation.providers';

import { NpmVersionLensProvider } from 'infrastructure.providers.npm';

import { extractPackageDependenciesFromJson } from './jspmPackageParser';
import { JspmConfig } from './jspmConfig';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(config: JspmConfig, client: IPackageClient<null>, logger: ILogger) {
    super(config, client, logger);
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
    };

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.client,
      packageDependencies,
      context,
    );
  }

}