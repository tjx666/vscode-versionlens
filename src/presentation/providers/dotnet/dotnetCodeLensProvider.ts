// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appContrib from '../../../appContrib';
import { extractDotnetLensDataFromDocument } from 'core/providers/dotnet/dotnetPackageParser'
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/lenses/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { resolveDotnetPackage } from './dotnetPackageResolver';
import { VersionLens } from 'presentation/lenses/models/versionLens';

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

    const packageDepsLenses = extractDotnetLensDataFromDocument(document, appContrib.dotnetCSProjDependencyProperties);
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
