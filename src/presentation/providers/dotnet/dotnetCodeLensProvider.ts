// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import DotnetConfig from 'core/providers/dotnet/config';
import { extractDotnetLensDataFromDocument } from 'core/providers/dotnet/dotnetPackageParser'
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/lenses/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { resolveDotnetPackage } from './dotnetPackageResolver';

export class DotNetCodeLensProvider extends AbstractVersionLensProvider {

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.{csproj,fsproj,targets,props}',
      group: ['tags'],
    }
  }

  fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractDotnetLensDataFromDocument(document, DotnetConfig.getCSProjDependencyProperties());
    if (packageDepsLenses.length === 0) return null;

    return VersionLensFactory.createVersionLenses(
      packagePath,
      document,
      packageDepsLenses,
      resolveDotnetPackage
    )

  }

  updateOutdated(packagePath: string) { }

}