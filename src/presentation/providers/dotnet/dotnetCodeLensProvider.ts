// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import DotnetConfig from 'core/providers/dotnet/config';
import { extractDotnetLensDataFromDocument } from 'core/providers/dotnet/dotnetPackageParser'
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { fetchDotnetPackage } from 'core/providers/dotnet/nugetApiClient';

export class DotNetCodeLensProvider extends AbstractVersionLensProvider {

  constructor() {
    super(DotnetConfig.provider);
  }

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.{csproj,fsproj,targets,props}',
      group: ['tags'],
    }
  }

  fetchVersionLenses(
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

  updateOutdated(packagePath: string) { }

}