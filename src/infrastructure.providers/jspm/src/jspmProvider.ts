import { TextDocument } from 'vscode';

import { ILogger } from 'core.logging';
import { RequestFactory } from 'core.packages';

import { NpmVersionLensProvider, NpmPackageClient } from 'infrastructure.providers.npm';

import { VersionLensFetchResponse } from 'presentation.providers';
import { VersionLensExtension } from 'presentation.extension';

import { extractPackageDependenciesFromJson } from './jspmPackageParser';

export class JspmVersionLensProvider extends NpmVersionLensProvider {

  constructor(
    extension: VersionLensExtension,
    client: NpmPackageClient,
    logger: ILogger
  ) {
    super(extension, client, logger);
  }

  async fetchVersionLenses(
    packagePath: string, document: TextDocument
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