import { TextDocument } from 'vscode';

import { ILogger } from 'core.logging';
import {
  extractPackageDependenciesFromYaml,
  RequestFactory
} from 'core.packages';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation.providers';
import { VersionLensExtension } from 'presentation.extension';

import { PubConfig } from './pubConfig';
import { PubClient } from './pubClient';
import { pubReplaceVersion } from './pubUtils';

export class PubVersionLensProvider extends AbstractVersionLensProvider<PubConfig> {

  client: PubClient;

  logger: ILogger

  constructor(extension: VersionLensExtension, client: PubClient, logger: ILogger) {
    super(extension, client.config, logger);
    this.client = client;
    this.logger = logger;
  }

  async fetchVersionLenses(
    packagePath: string, document: TextDocument
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
      this.client,
      packageDependencies,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}