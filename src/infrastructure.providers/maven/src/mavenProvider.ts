import { TextDocument } from 'vscode';

import { ILogger } from 'core.logging';
import { UrlHelpers } from 'core.clients';
import { RequestFactory } from 'core.packages';

import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation.providers';
import { VersionLensExtension } from 'presentation.extension';

import { MavenClientData } from './definitions/mavenClientData';
import { MvnCli } from './clients/mvnCli';
import { MavenClient } from './clients/mavenClient';
import * as MavenXmlFactory from './mavenXmlParserFactory';
import { MavenConfig } from './mavenConfig';

export class MavenVersionLensProvider extends AbstractVersionLensProvider<MavenConfig> {

  mvnCli: MvnCli;

  client: MavenClient;

  constructor(
    extension: VersionLensExtension,
    mnvCli: MvnCli,
    client: MavenClient,
    logger: ILogger
  ) {
    super(extension, client.config, logger);

    this.mvnCli = mnvCli;
    this.client = client;
  }

  async fetchVersionLenses(
    packagePath: string, document: TextDocument
  ): VersionLensFetchResponse {
    const packageDependencies = MavenXmlFactory.createDependenciesFromXml(
      document.getText(),
      this.config.dependencyProperties
    );
    if (packageDependencies.length === 0) return null;

    // gets source feeds from the project path
    const promisedRepos = this.mvnCli.fetchRepositories(packagePath);

    return promisedRepos.then(repos => {

      const repositories = repos.filter(
        repo => repo.protocol === UrlHelpers.RegistryProtocols.https
      );

      const includePrereleases = this.extension.state.prereleasesEnabled.value;

      const clientData: MavenClientData = { repositories }

      const clientContext = {
        includePrereleases,
        clientData,
      }

      return RequestFactory.executeDependencyRequests(
        packagePath,
        this.client,
        packageDependencies,
        clientContext,
      );
    })

  }

}