import { TextDocument } from 'vscode';

import { ILogger } from 'core.logging';
import {
  extractPackageDependenciesFromJson,
  RequestFactory
} from 'core.packages';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation.providers';
import { VersionLensExtension } from 'presentation.extension';

import { NpmPackageClient } from './clients/npmPackageClient';
import { NpmConfig } from './npmConfig';
import { npmReplaceVersion } from './npmUtils';

export class NpmVersionLensProvider extends AbstractVersionLensProvider<NpmConfig> {

  logger: ILogger;

  client: NpmPackageClient;

  constructor(
    extension: VersionLensExtension,
    client: NpmPackageClient,
    logger: ILogger
  ) {
    super(extension, client.config, logger);

    this.logger = logger;
    this.client = client;
    this.customReplaceFn = npmReplaceVersion;
  }

  async fetchVersionLenses(
    packagePath: string, document: TextDocument
  ): VersionLensFetchResponse {

    const packageDependencies = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.dependencyProperties
    );
    if (packageDependencies.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      includePrereleases,
      clientData: null,
    }

    if (this.config.github.accessToken &&
      this.config.github.accessToken.length > 0) {
      // defrost github parameters
      this.config.github.defrost();
    }

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.client,
      packageDependencies,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {

  }

}