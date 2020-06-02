// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core.logging';
import { UrlHelpers } from 'core.clients';
import { RequestFactory } from 'core.packages';

import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation.providers';

import { NuGetClientData } from './definitions/nuget';
import { DotNetConfig } from './dotnetConfig';
import { createDependenciesFromXml } from './dotnetXmlParserFactory'
import { DotNetCli } from './clients/dotnetCli';
import { NuGetPackageClient } from './clients/nugetPackageClient';
import { NuGetResourceClient } from './clients/nugetResourceClient';

export class DotNetVersionLensProvider
  extends AbstractVersionLensProvider<DotNetConfig> {

  dotnetClient: DotNetCli;

  nugetPackageClient: NuGetPackageClient;

  nugetResClient: NuGetResourceClient;

  constructor(
    dotnetConfig: DotNetConfig,
    dotnetCli: DotNetCli,
    nugetClient: NuGetPackageClient,
    nugetResClient: NuGetResourceClient,
    dotnetLogger: ILogger
  ) {
    super(dotnetConfig, dotnetLogger);

    this.dotnetClient = dotnetCli;
    this.nugetPackageClient = nugetClient;
    this.nugetResClient = nugetResClient;
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDependencies = createDependenciesFromXml(
      document.getText(),
      this.config.dependencyProperties
    );
    if (packageDependencies.length === 0) return null;

    // ensure latest nuget sources from settings
    this.config.nuget.defrost();

    // get each service index source from the dotnet cli
    const sources = await this.dotnetClient.fetchSources(packagePath)

    // remote sources only
    const remoteSources = sources.filter(
      s => s.protocol === UrlHelpers.RegistryProtocols.https ||
        s.protocol === UrlHelpers.RegistryProtocols.http
    );

    // resolve each service url
    const promised = remoteSources.map(
      async (remoteSource) => {
        return await this.nugetResClient.fetchResource(remoteSource);
      }
    );

    const autoCompleteUrls = await Promise.all(promised);
    if (autoCompleteUrls.length === 0) return null;

    const clientData: NuGetClientData = { serviceUrls: autoCompleteUrls }

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      includePrereleases,
      clientData,
    }

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.nugetPackageClient,
      packageDependencies,
      context,
    );

  }

}