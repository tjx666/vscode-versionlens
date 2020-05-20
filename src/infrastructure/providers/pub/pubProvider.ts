// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core/logging';
import { extractPackageDependenciesFromYaml, RequestFactory } from "core/packages";

import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers';

import { PubConfig } from './pubConfig';
import { PubClient } from './pubClient';
import { pubReplaceVersion } from './pubUtils';

export class PubVersionLensProvider
  extends AbstractVersionLensProvider<PubConfig> {

  pubClient: PubClient;

  constructor(config: PubConfig, logger: ILogger) {
    super(config, logger);
    this.pubClient = new PubClient(
      config,
      logger.child({ namespace: 'pub pkg client' })
    );
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const yamlText = document.getText();

    const packageDependencies = extractPackageDependenciesFromYaml(
      yamlText,
      this.config.dependencyProperties
    );
    if (packageDependencies.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      includePrereleases,
      clientData: null,
    };

    this.customReplaceFn = pubReplaceVersion.bind(yamlText);

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.pubClient,
      packageDependencies,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}