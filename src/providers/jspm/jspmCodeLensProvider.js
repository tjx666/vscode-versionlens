/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageCodeLens } from '../../common/packageCodeLens';
import { appConfig } from '../../common/appConfiguration';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';
import { clearDecorations } from '../../editor/decorations';
import { extractDependencyNodes, parseDependencyNodes } from '../../common/dependencyParser';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { getJspmRootNode } from './jspmDependencyParser';
import { jspmPackageParser } from './jspmPackageParser';

const path = require('path');
const jsonParser = require('vscode-contrib-jsonc');

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return;

    this._documentPath = path.dirname(document.uri.fsPath);

    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const jspmRootNode = getJspmRootNode(jsonDoc.root);
    if (jspmRootNode === null)
      return;

    const dependencyNodes = extractDependencyNodes(
      jspmRootNode,
      appConfig.npmDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig,
      jspmPackageParser
    );

    appSettings.inProgress = true;
    return generateCodeLenses(packageCollection, document)
      .then(codelenses => {
        appSettings.inProgress = false;
        return codelenses;
      });
  }

}