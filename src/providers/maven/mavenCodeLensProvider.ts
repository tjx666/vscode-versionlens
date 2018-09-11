import * as CommandFactory from 'commands/factory';
import appSettings from 'common/appSettings';
import appContrib from 'common/appContrib';
import { parseDependencyNodes } from 'common/dependencyParser';
import { generateCodeLenses } from 'common/codeLensGeneration';
import { AbstractCodeLensProvider } from 'providers/abstractCodeLensProvider';
import { findNodesInXmlContent } from './mavenDependencyParser';
import { mavenPackageParser } from './mavenPackageParser';

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
    if (appSettings.showVersionLenses === false)
      return;

    const dependencyNodes = findNodesInXmlContent(
      document.getText(),
      document,
      appContrib.mavenDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appContrib,
      mavenPackageParser
    );

    appSettings.inProgress = true;
    return generateCodeLenses(packageCollection, document)
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
    return CommandFactory.createNewVersionCommand(
      tagVersion,
      codeLens
    );
  }

}
