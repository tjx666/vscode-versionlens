// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import DotnetConfig from 'providers/dotnet/config';
import { extractDotnetLensDataFromDocument } from 'providers/dotnet/dotnetPackageParser'
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import { VersionLensFactory } from 'presentation/lenses';
import { fetchDotnetPackage } from 'providers/dotnet/clients/nugetApiClient';

export class DotNetCodeLensProvider extends AbstractVersionLensProvider {

  constructor() {
    super(DotnetConfig);
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractDotnetLensDataFromDocument(document, DotnetConfig.getCSProjDependencyProperties());
    if (packageDepsLenses.length === 0) return null;

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      this.logger,
      fetchDotnetPackage,
      null
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {
    return Promise.resolve();
  }

}