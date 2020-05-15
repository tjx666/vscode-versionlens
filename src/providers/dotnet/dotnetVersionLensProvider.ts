// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation/providers';

import { VersionLensFactory } from 'presentation/lenses';

import { DotNetConfig } from './config';
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

  constructor(config: DotNetConfig) {
    super(config);

    // todo get cache durations from config
    this.dotnetClient = new DotNetClient(config, 0);
    this.nugetPackageClient = new NuGetPackageClient(config, 0);
    this.nugetResourceClient = new NuGetResourceClient(config, 0);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractDotnetLensDataFromDocument(
      document,
      this.config.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    // package path
    const { dirname } = require('path');
    const packagePath = dirname(document.uri.fsPath);

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
          provider: this.config.provider,
          autoCompleteUrl,
        }

        const context = {
          client: this.nugetPackageClient,
          clientData,
          logger: this.logger,
        }

        return VersionLensFactory.createVersionLenses(
          document,
          packageDepsLenses,
          context,
        );

      })

    });

  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}