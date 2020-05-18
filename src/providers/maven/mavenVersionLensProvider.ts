// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core/logging';
import { UrlHelpers } from 'core/clients';

import { AbstractVersionLensProvider } from 'presentation/providers';
import { VersionLensFactory } from 'presentation/lenses';

import { extractMavenLensDataFromDocument } from 'providers/maven/mavenPackageParser';
import { MavenConfig } from './config';
import { MavenClientData } from './definitions';
import { MvnClient } from './clients/mvnClient';
import { MavenClient } from './clients/mavenClient';

export class MavenVersionLensProvider
  extends AbstractVersionLensProvider<MavenConfig> {

  mvnClient: MvnClient;
  mavenClient: MavenClient;

  constructor(config: MavenConfig, logger: ILogger) {
    super(config, logger);

    this.mvnClient = new MvnClient(config, logger);
    this.mavenClient = new MavenClient(config, logger);
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken,
  ) {
    const packageDependencies = extractMavenLensDataFromDocument(
      document,
      this.config.dependencyProperties
    );
    if (packageDependencies.length === 0) return null;

    // gets source feeds from the project path
    const promisedRepos = this.mvnClient.fetchRepositories(packagePath);

    return promisedRepos.then(repos => {

      const repositories = repos.filter(
        repo => repo.protocol === UrlHelpers.RegistryProtocols.https
      );

      const includePrereleases = this.extension.state.prereleasesEnabled.value;

      const clientData: MavenClientData = {
        repositories,
      }

      const context = {
        includePrereleases,
        clientData,
      }

      return VersionLensFactory.createVersionLenses(
        this.mavenClient,
        document,
        packageDependencies,
        context,
      );

    })

  }

}
