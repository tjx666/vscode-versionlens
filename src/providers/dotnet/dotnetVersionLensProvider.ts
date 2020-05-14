// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import { VersionLensFactory } from 'presentation/lenses';

import { DotNetConfig } from './config';
import { extractDotnetLensDataFromDocument } from './dotnetPackageParser'
import { DotNetClient } from './clients/dotnetClient';
import { NuGetClient } from './clients/nugetClient';
import { NuGetClientData } from './definitions';


export class DotNetVersionLensProvider
  extends AbstractVersionLensProvider<DotNetConfig> {

  dotnetClient: DotNetClient;
  nugetClient: NuGetClient;

  constructor(config: DotNetConfig) {
    super(config);

    // todo get cache durations from config
    this.dotnetClient = new DotNetClient(config, 0);
    this.nugetClient = new NuGetClient(config, 0);
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

    // get sources
    const sources = await this.dotnetClient.fetchSources(packagePath);

    const clientData: NuGetClientData = {
      provider: this.config.provider,
      sources,
    }

    const context = {
      client: this.nugetClient,
      clientData,
      logger: this.logger,
      // todo client specific data {sources, config etc.....}
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