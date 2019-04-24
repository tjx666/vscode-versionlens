/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AbstractCodeLensProvider } from "../abstractCodeLensProvider";
import appContrib from "../../common/appContrib";
import { generateCodeLenses } from "../../common/codeLensGeneration";
import appSettings from "../../common/appSettings";
import {
  findNodesInYamlContent,
  extractDependencyNodes,
  parseDependencyNodes
} from "./pubDependencyParser";
import * as CommandFactory from "../../commands/factory";
import { pubGetPackageInfo } from "./pubAPI";
import { pubPackageParser } from "./pubPackageParser";

export class PubCodeLensProvider extends AbstractCodeLensProvider {
  get selector() {
    return {
      language: "yaml",
      scheme: "file",
      pattern: "**/pubspec.yaml"
    };
  }

  provideCodeLenses(document) {
    if (appSettings.showVersionLenses === false) {
      return;
    }

    const dependencyNodes = findNodesInYamlContent(
      document,
      appContrib.pubDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appContrib,
      pubPackageParser
    );

    appSettings.inProgress = true;
    return generateCodeLenses(packageCollection, document).then(codelenses => {
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
