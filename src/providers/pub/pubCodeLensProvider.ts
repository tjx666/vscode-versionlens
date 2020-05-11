import appContrib from "../../appContrib";
import appSettings from "../../appSettings";
import { AbstractCodeLensProvider } from "presentation/lenses/definitions/abstractCodeLensProvider";
import { IVersionCodeLens } from "presentation/lenses/definitions/IVersionCodeLens";
import * as CodeLensFactory from 'presentation/lenses/factories/codeLensFactory';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { extractPackageLensDataFromText } from "./pubPackageParser";
import { pubGetPackageInfo } from "./pubAPI";
import { resolvePubPackage } from "./pubPackageResolver";

export class PubCodeLensProvider extends AbstractCodeLensProvider {
  get selector() {
    return {
      language: "yaml",
      scheme: "file",
      pattern: "**/pubspec.yaml"
    };
  }

  provideCodeLenses(document) {
    if (appSettings.showVersionLenses === false) return [];

    const packageDepsLenses = extractPackageLensDataFromText(document.getText(), appContrib.pubDependencyProperties);
    if (packageDepsLenses.length === 0) return [];

    const packageLensResolvers = PackageLensFactory.createPackageLensResolvers(
      '',
      packageDepsLenses,
      null
    );

    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return CodeLensFactory.createCodeLenses(packageLensResolvers, document).then(codelenses => {
      appSettings.inProgress = false;
      return codelenses;
    });
  }

  evaluateCodeLens(codeLens: IVersionCodeLens) {
    /*
    if (
      codeLens.command &&
      codeLens.command.command.includes("updateDependenciesCommand")
    ) {
      return codeLens;
    }

    if (codeLens.package.version === "latest") {
      return CommandFactory.createMatchesLatestVersionCommand(codeLens);
    }

    return pubGetPackageInfo(codeLens.package.name)
      .then((info: any) => {
        return CommandFactory.createVersionCommand(
          codeLens.package.version,
          info.latestStableVersion,
          codeLens
        );
      })
      .catch(error => {
        if (error.status == 404) return CommandFactory.createPackageNotFoundCommand(codeLens);

        logErrorToConsole("Pub", "evaluateCodeLens", codeLens.package.name, error);
        return CommandFactory.createPackageUnexpectedError(codeLens.package.name);
      });
      */
  }
}
