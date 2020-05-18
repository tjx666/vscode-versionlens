// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core/logging';

import { VersionLensFactory } from 'presentation/lenses';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers';

import { DotNetConfig } from './dotnetConfig';
import { extractDotnetLensDataFromDocument } from './dotnetPackageParser'
import { DotNetClient } from './clients/dotnetClient';
import { NuGetPackageClient } from './clients/nugetPackageClient';
import { NuGetResourceClient } from './clients/nugetResourceClient';
import { NuGetClientData } from './definitions/nuget';
import { RegistryProtocols } from 'core/clients/helpers/urlHelpers';

export class DotNetVersionLensProvider
  extends AbstractVersionLensProvider<DotNetConfig> {

  dotnetClient: DotNetClient;
  nugetPackageClient: NuGetPackageClient;
  nugetResourceClient: NuGetResourceClient;

  constructor(config: DotNetConfig, logger: ILogger) {
    super(config, logger);

    this.dotnetClient = new DotNetClient(config, logger);
    this.nugetPackageClient = new NuGetPackageClient(config, logger);
    this.nugetResourceClient = new NuGetResourceClient(config, logger);
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractDotnetLensDataFromDocument(
      document,
      this.config.dependencyProperties
    );
    if (packageDepsLenses.length === 0) return null;

    // defrost cache settings
    this.config.caching.defrost();

    // gets source feeds from the project path
    const promisedSources = this.dotnetClient.fetchSources(packagePath);

    return promisedSources.then(sources => {

      const remoteSources = sources.filter(
        s => s.protocol === RegistryProtocols.https
      );

      const promisedResource = this.nugetResourceClient.fetchResource(
        remoteSources[0]
      );

      return promisedResource.then((autoCompleteUrl: string) => {

        const clientData: NuGetClientData = {
          autoCompleteUrl,
        }

        const includePrereleases = this.extension.state.prereleasesEnabled.value;

        const context = {
          includePrereleases,
          clientData,
        }

        return VersionLensFactory.createVersionLenses(
          this.nugetPackageClient,
          document,
          packageDepsLenses,
          context,
        );

      });

    });

  }

}