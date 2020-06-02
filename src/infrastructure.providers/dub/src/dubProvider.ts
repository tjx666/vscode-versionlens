// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core.logging';
import { extractPackageDependenciesFromJson, RequestFactory } from 'core.packages';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation.providers';

import { DubConfig } from './dubConfig';
import { DubClient } from './dubClient';

export class DubVersionLensProvider extends AbstractVersionLensProvider<DubConfig> {

  client: DubClient;

  constructor(config: DubConfig, client: DubClient, logger: ILogger) {
    super(config, logger);
    this.client = client;
    this.logger = logger;
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
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