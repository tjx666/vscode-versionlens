/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import * as httpRequest from 'request-light';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';
import {
  extractDependencyNodes,
  parseDependencyNodes,
  createDependencyNode
} from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';
import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration,
  clearDecorations
} from '../../editor/decorations';
import * as fs from 'fs';
import { formatWithExistingLeading } from '../../common/utils';

export class DubCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/dub.json'
    };
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return;

    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const dubJson = ((document.uri || {}).fsPath || "").toString();

    if (dubJson.endsWith(".json")) {
      // dub.json -> dub.selections.json
      const dubSelections = dubJson.slice(0, -4) + "selections.json";
      this.selectionsJson = undefined;
      if (fs.existsSync(dubSelections)) {
        fs.readFile(dubSelections, "utf-8", (err, data) => {
          if (err) {
            renderMissingDecoration(codeLens.range);
            return;
          }
          this.selectionsJson = JSON.parse(data.toString());
          if (this.selectionsJson.fileVersion != 1)
            console.warn("Unknown dub.selections.json version " + this.selectionsJson.fileVersion);
        });
      }
    }

    const dependencyNodes = extractDependencyNodes(
      jsonDoc.root,
      appConfig.dubDependencyProperties
    );

    const subObjectNodes = this.extractCustomDependencyNodes(jsonDoc.root);
    dependencyNodes.push(...subObjectNodes)

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig
    );

    return generateCodeLenses(packageCollection, document);
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.createLatestCommand(codeLens);

    if (codeLens.package.version === '~master')
      return CommandFactory.createLatestCommand(codeLens);

    // generate decoration
    if (appSettings.showDependencyStatuses)
      this.generateDecoration(codeLens);

    const queryUrl = `https://code.dlang.org/api/packages/${encodeURIComponent(codeLens.package.name)}/latest`;

    return httpRequest.xhr({ url: queryUrl })
      .then(response => {
        if (response.status != 200)
          return CommandFactory.createErrorCommand(
            response.responseText,
            codeLens
          );

        const verionStr = JSON.parse(response.responseText);
        if (typeof verionStr !== "string")
          return CommandFactory.createErrorCommand(
            "Invalid object returned from server",
            codeLens
          );

        return CommandFactory.createVersionCommand(
          codeLens.package.version,
          verionStr,
          codeLens
        );
      })
      .catch(response => {
        if (response.status == 404)
          return CommandFactory.createPackageNotFoundCommand(codeLens);
        const respObj = JSON.parse(response.responseText);
        console.error(respObj.statusMessage);
        return CommandFactory.createErrorCommand(
          "An error occurred retrieving this package.",
          codeLens
        );
      });
  }

  extractCustomDependencyNodes(rootNode, customVersionParser) {
    const nodes = [];
    rootNode.getChildNodes()
      .forEach(childNode => {
        if (childNode.key.value == "subPackages") {
          childNode.value.items.forEach(subPackage => {
            if (subPackage.type == "object") {
              subPackage.properties.forEach(
                property => nodes.push(createDependencyNode(property))
              );
            }
          });

        }
      });
    return nodes;
  }

  generateDecoration(codeLens) {
    const currentPackageName = codeLens.package.name;
    const currentPackageVersion = codeLens.package.version;

    if (!codeLens.range)
      return;

    if (!this.selectionsJson) {
      renderMissingDecoration(codeLens.range);
      return;
    }

    const currentVersion = this.selectionsJson.versions[currentPackageName];
    if (!currentVersion) {
      renderMissingDecoration(codeLens.range);
      return;
    }

    if (formatWithExistingLeading(currentPackageVersion, currentVersion) == currentPackageVersion) {
      renderInstalledDecoration(
        codeLens.range,
        currentPackageVersion
      );
      return;
    }

    renderOutdatedDecoration(
      codeLens.range,
      currentVersion
    );

  }
}