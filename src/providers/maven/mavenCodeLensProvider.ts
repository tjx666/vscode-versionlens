// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appContrib from '../../appContrib';
import { AbstractVersionLensProvider } from 'presentation/lenses/abstract/abstractVersionLensProvider';
import { createCodeLenses } from 'presentation/lenses/factories/codeLensFactory';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { extractMavenLensDataFromDocument } from './mavenPackageParser';
import { resolveMavenPackage } from './mavenPackageResolver';
import { loadMavenRepositories } from './mavenAPI';

export class MavenCodeLensProvider extends AbstractVersionLensProvider {

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/pom.xml',
      group: ['tags'],
    }
  }

  async fetchVersionLenses(packagePath: string, document: VsCodeTypes.TextDocument, token: VsCodeTypes.CancellationToken) {
    const packageDepsLenses = extractMavenLensDataFromDocument(document, appContrib.pubDependencyProperties);
    if (packageDepsLenses.length === 0) return Promise.resolve([]);

    return VersionLensFactory.createVersionLenses(
      packagePath,
      document,
      packageDepsLenses,
      resolveMavenPackage
    );

  }

  updateOutdated(packagePath: string) { }

  /*
provideCodeLenses(document, token) {

  if (appSettings.showVersionLenses === false) return [];

  return loadMavenRepositories().then(_ => {
    const packageDepsLenses = extractMavenLensDataFromText(document, appContrib.mavenDependencyProperties);
    if (packageDepsLenses.length === 0) return [];

    const packageLensResolvers = ResponseFactory.createPackageRequests(
      '',
      packageDepsLenses,
      resolveMavenPackage
    );
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return createCodeLenses(packageLensResolvers, document)
      .then(codelenses => {
        appSettings.inProgress = false;
        return codelenses;
      });
  });

  return [];
}    */
  /*
evaluateCodeLens(codeLens: IVersionCodeLens) {

  // check if this package was found
  if (codeLens.hasPackageError(PackageErrors.NotFound))
    return CommandFactory.createPackageNotFoundCommand(codeLens);

  // check if this is a tagged version
  if (codeLens.isTaggedVersion())
    return CommandFactory.createTaggedVersionCommand(codeLens);

  // check if this install a tagged version
  if (codeLens.isInvalidVersion())
    return CommandFactory.createInvalidVersionCommand(codeLens);

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
  return CommandFactory.createNewVersionCommand(
    tagVersion,
    codeLens
  );

}
  */
}
