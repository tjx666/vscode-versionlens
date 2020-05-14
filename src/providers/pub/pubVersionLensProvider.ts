// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { extractPackageDependenciesFromYaml } from "core/packages";
import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from "presentation/providers/abstract/abstractVersionLensProvider";
import { VersionLensFactory } from 'presentation/lenses';
import { PubConfig } from './config';
import { PubClient } from './pubClient';

export class PubVersionLensProvider
  extends AbstractVersionLensProvider<PubConfig> {

  pubClient: PubClient;

  constructor(config: PubConfig) {
    super(config);

    this.pubClient = new PubClient(config, 0);
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

    const context = {
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