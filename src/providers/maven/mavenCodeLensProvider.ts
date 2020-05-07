import * as CommandFactory from '../../commands/factory';
import appSettings from '../../appSettings';
import appContrib from '../../appContrib';
import { AbstractCodeLensProvider } from '../abstract/abstractCodeLensProvider';
import { generateCodeLenses } from '../shared/codeLensGeneration';
import { resolvePackageLensData } from '../shared/dependencyParser';
import { extractMavenLensDataFromText } from './mavenPackageParser';
import { resolveMavenPackage } from './mavenPackageResolver';
import { loadMavenRepositories } from './mavenAPI';
import { IPackageCodeLens, PackageErrors } from '../shared/definitions';

export class MavenCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/pom.xml',
      group: ['tags'],
    }
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false) return [];

    return loadMavenRepositories().then(_ => {
      const packageLensData = extractMavenLensDataFromText(document, appContrib.mavenDependencyProperties);
      if (packageLensData.length === 0) return [];

      const packageLensResolvers = resolvePackageLensData(packageLensData, appContrib, resolveMavenPackage);
      if (packageLensResolvers.length === 0) return [];

      appSettings.inProgress = true;
      return generateCodeLenses(packageLensResolvers, document)
        .then(codelenses => {
          appSettings.inProgress = false;
          return codelenses;
        });
    });
  }

  evaluateCodeLens(codeLens: IPackageCodeLens) {
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

}
