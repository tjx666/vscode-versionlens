/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from 'common/appSettings';
import { PackageCodeLens } from 'common/packageCodeLens';
import appContrib from 'common/appContrib';
import { generateCodeLenses } from 'common/codeLensGeneration';
import { parseDependencyNodes } from 'common/dependencyParser';
import { NpmCodeLensProvider } from '../npm/npmCodeLensProvider';
import { findNodesInJsonContent } from './jspmDependencyParser';
import { jspmPackageParser } from './jspmPackageParser';

const path = require('path');

export class JspmCodeLensProvider extends NpmCodeLensProvider {

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return;

    this._documentPath = path.dirname(document.uri.fsPath);

    const dependencyNodes = findNodesInJsonContent(
      document.getText(),
      appContrib.npmDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appContrib,
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