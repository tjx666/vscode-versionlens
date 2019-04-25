/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from 'common/appSettings';
import appContrib from 'common/appContrib';
import { generateCodeLenses } from 'common/codeLensGeneration';
import { parseDependencyNodes } from 'common/dependencyParser';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { findNodesInJsonContent } from './jspmDependencyParser';
import { jspmPackageParser } from './jspmPackageParser';

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return [];

    const path = require('path');
    this._documentPath = path.dirname(document.uri.fsPath);

    const dependencyNodes = findNodesInJsonContent(
      document.getText(),
      appContrib.npmDependencyProperties
    );

    if(dependencyNodes.length === 0)
      return [];

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appContrib,
      jspmPackageParser.bind(null, this._documentPath)
    );

    appSettings.inProgress = true;
    return generateCodeLenses(packageCollection, document)
      .then(codelenses => {
        return codelenses;
      });
  }

}