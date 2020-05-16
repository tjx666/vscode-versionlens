// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { AbstractVersionLensProvider } from 'presentation/lenses';
import { extractMavenLensDataFromDocument } from 'providers/maven/mavenPackageParser';
import { VersionLensFactory } from 'presentation/lenses';
import { MavenConfig } from './config';
import { MavenClientData } from './definitions';
import { MvnClient } from './clients/mvnClient';
import { MavenClient } from './clients/mavenClient';
import { RegistryProtocols } from 'core/clients/helpers/urlHelpers';
import { ILogger } from 'core/logging';

export class MavenVersionLensProvider
  extends AbstractVersionLensProvider<MavenConfig> {

  mvnClient: MvnClient;
  mavenClient: MavenClient;

  constructor(
    mvnClient: MvnClient,
    mavenClient: MavenClient,
    config: MavenConfig,
    logger: ILogger
  ) {
    super(config, logger);

    this.mvnClient = mvnClient
    this.mavenClient = mavenClient
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken,
  ) {
    const packageDependencies = extractMavenLensDataFromDocument(
      document,
      this.config.getDependencyProperties()
    );
    if (packageDependencies.length === 0) return null;

    // package path
    const { dirname } = require('path');
    const packagePath = dirname(document.uri.fsPath);

    // gets source feeds from the project path
    const promisedRepos = this.mvnClient.fetchRepositories(packagePath);

    return promisedRepos.then(repos => {

      const repositories = repos.filter(repo => repo.protocol === RegistryProtocols.https)

      const clientData: MavenClientData = {
        provider: this.config.providerName,
        repositories,
      }

      const includePrereleases = this.extension.state.prereleasesEnabled.value;

      const context = {
        providerName: this.config.providerName,
        includePrereleases,
        client: this.mavenClient,
        clientData,
        logger: this.logger,
      }

      return VersionLensFactory.createVersionLenses(
        document,
        packageDependencies,
        context,
      );

    })

  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}
