/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appContrib from "../../appContrib";
import appSettings from "../../appSettings";
import { AbstractCodeLensProvider } from "presentation/lenses/definitions/abstractCodeLensProvider";
import { IVersionCodeLens } from "presentation/lenses/definitions/IVersionCodeLens";
import { createCodeLenses } from 'presentation/lenses/factories/codeLensFactory';
import { logErrorToConsole } from "../shared/utils";
import { resolvePackageLensData } from '../shared/dependencyParser';
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

    const packageLensData = extractPackageLensDataFromText(document.getText(), appContrib.pubDependencyProperties);
    if (packageLensData.length === 0) return [];

    const packageLensResolvers = resolvePackageLensData(packageLensData, appContrib, resolvePubPackage);
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return createCodeLenses(packageLensResolvers, document).then(codelenses => {
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
