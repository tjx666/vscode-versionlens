import appSettings from '../../../appSettings';
import appContrib from '../../../appContrib';
import { extractDotnetLensDataFromText } from 'core/providers/dotnet/dotnetPackageParser'
import { AbstractCodeLensProvider } from 'presentation/lenses/definitions/abstractCodeLensProvider';
import * as CodeLensFactory from 'presentation/lenses/factories/codeLensFactory';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { resolveDotnetPackage } from './dotnetPackageResolver';

export class DotNetCodeLensProvider extends AbstractCodeLensProvider {

  packagePath: '';

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.{csproj,fsproj,targets,props}',
      group: ['tags'],
    }
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false) return [];

    const path = require('path');
    this.packagePath = path.dirname(document.uri.fsPath);

    const packageDepsLenses = extractDotnetLensDataFromText(document, appContrib.dotnetCSProjDependencyProperties);
    if (packageDepsLenses.length === 0) return [];

    const packageLensResolvers = PackageLensFactory.createPackageLensResolvers(
      this.packagePath,
      packageDepsLenses,
      resolveDotnetPackage
    );
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return CodeLensFactory.createCodeLenses(packageLensResolvers, document)
      .then(codelenses => {
        appSettings.inProgress = false;
        return codelenses;
      });
  }

}
