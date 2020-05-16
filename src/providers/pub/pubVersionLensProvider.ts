// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { extractPackageDependenciesFromYaml } from "core/packages";

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse,
  VersionLensFactory
} from 'presentation/lenses';

import { PubConfig } from './config';
import { PubClient } from './pubClient';
import { ILogger } from 'core/logging';

export class PubVersionLensProvider
  extends AbstractVersionLensProvider<PubConfig> {

  pubClient: PubClient;

  constructor(
    pubClient: PubClient,
    config: PubConfig,
    logger: ILogger
  ) {
    super(config, logger);
    this.pubClient = pubClient;
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractPackageDependenciesFromYaml(
      document.getText(),
      this.config.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      providerName: this.config.providerName,
      includePrereleases,
      client: this.pubClient,
      clientData: this.config,
      logger: this.logger,
    }

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}