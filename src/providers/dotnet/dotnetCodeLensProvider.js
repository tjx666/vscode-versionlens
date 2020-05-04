/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as CommandFactory from 'commands/factory';
import appSettings from 'common/appSettings';
import appContrib from 'common/appContrib';
import { AbstractCodeLensProvider } from 'providers/abstract/abstractCodeLensProvider';
import { resolvePackageLensData } from 'providers/shared/dependencyParser';
import { generateCodeLenses } from 'providers/shared/codeLensGeneration';
import { resolveDotnetPackage } from './dotnetPackageResolver.js';
import { extractDotnetLensDataFromText } from 'dotnetPackageParser'

export class DotNetCodeLensProvider extends AbstractCodeLensProvider {

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

    const packageLensData = extractDotnetLensDataFromText(document, appContrib.dotnetCSProjDependencyProperties);
    if (packageLensData.length === 0) return [];

    const packageLensResolvers = resolvePackageLensData(packageLensData, appContrib, resolveDotnetPackage);
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return generateCodeLenses(packageLensResolvers, document)
      .then(codelenses => {
        appSettings.inProgress = false;
        return codelenses;
      });
  }

  evaluateCodeLens(codeLens) {
    // check if this package was found
    if (codeLens.packageNotFound())
      return CommandFactory.createPackageNotFoundCommand(codeLens);

    // check if this is a tagged version
    if (codeLens.isTaggedVersion())
      return CommandFactory.createTaggedVersionCommand(codeLens);

    // check if this install a tagged version
    if (codeLens.isInvalidVersion())
      return CommandFactory.createInvalidCommand(codeLens);

    // check if this entered versions matches a registry versions
    if (codeLens.versionMatchNotFound())
      return CommandFactory.createVersionMatchNotFoundCommand(codeLens);

    // check if this matches prerelease version
    if (codeLens.matchesPrereleaseVersion())
      return CommandFactory.createMatchesPrereleaseVersionCommand(codeLens);

    // check if this is the latest version
    if (codeLens.matchesLatestVersion())
      return CommandFactory.createMatchesLatestVersionCommand(codeLens);

    // check if this satisfies the latest version
    if (codeLens.satisfiesLatestVersion())
      return CommandFactory.createSatisfiesLatestVersionCommand(codeLens);

    // check if this is a fixed version
    if (codeLens.isFixedVersion())
      return CommandFactory.createFixedVersionCommand(codeLens);

    const tagVersion = codeLens.getTaggedVersion();
    return CommandFactory.createVersionCommand(
      codeLens.package.version,
      tagVersion,
      codeLens
    );
  }

}
