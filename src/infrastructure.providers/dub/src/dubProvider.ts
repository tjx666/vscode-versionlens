import { TextDocument } from 'vscode';

import { ILogger } from 'core.logging';
import { extractPackageDependenciesFromJson, RequestFactory } from 'core.packages';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation.providers';
import { VersionLensExtension } from 'presentation.extension';

import { DubConfig } from './dubConfig';
import { DubClient } from './dubClient';

export class DubVersionLensProvider extends AbstractVersionLensProvider<DubConfig> {

  client: DubClient;

  constructor(
    extension: VersionLensExtension,
    client: DubClient,
    logger: ILogger
  ) {
    super(extension, client.config, logger);
    this.client = client;
    this.logger = logger;
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

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.client,
      packageDependencies,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}