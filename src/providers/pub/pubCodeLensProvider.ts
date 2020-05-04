/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appContrib from "common/appContrib";
import appSettings from "common/appSettings";
import * as CommandFactory from "commands/factory";
import { AbstractCodeLensProvider } from "providers/abstract/abstractCodeLensProvider";
import { resolvePackageLensData } from 'providers/shared/dependencyParser';
import { generateCodeLenses } from 'providers/shared/codeLensGeneration';
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
    return generateCodeLenses(packageLensResolvers, document).then(codelenses => {
      appSettings.inProgress = false;
      return codelenses;
    });
  }

  evaluateCodeLens(codeLens) {
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
      .catch(err => {
        console.error(err);
        return CommandFactory.createErrorCommand(
          `An error occurred retrieving '${codeLens.package.name}' package`,
          codeLens
        );
      });
  }
}
