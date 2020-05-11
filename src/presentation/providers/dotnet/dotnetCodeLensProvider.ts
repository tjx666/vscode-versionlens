/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from '../../../appSettings';
import appContrib from '../../../appContrib';
import { AbstractCodeLensProvider } from '../../lenses/definitions/abstractCodeLensProvider';
import { resolvePackageLensData } from '../../../providers/shared/dependencyParser';
import { createCodeLenses } from '../../lenses/factories/codeLensFactory';
import { resolveDotnetPackage } from './dotnetPackageResolver';
import { extractDotnetLensDataFromText } from 'core/providers/dotnet/dotnetPackageParser'

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

    const packageLensResolvers = resolvePackageLensData(
      this.packagePath,
      packageDepsLenses,
      resolveDotnetPackage
    );
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return createCodeLenses(packageLensResolvers, document)
      .then(codelenses => {
        appSettings.inProgress = false;
        return codelenses;
      });
  }

}
