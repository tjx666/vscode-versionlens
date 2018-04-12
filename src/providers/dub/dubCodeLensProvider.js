/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as CommandFactory from 'commands/factory';
import { PackageCodeLens } from 'common/packageCodeLens';
import appContrib from 'common/appContrib';
import { generateCodeLenses } from 'common/codeLensGeneration';
import appSettings from 'common/appSettings';
import { formatWithExistingLeading } from 'common/utils';
import { parseDependencyNodes } from 'common/dependencyParser';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { dubGetPackageLatest, readDubSelections } from './dubAPI';
import { findNodesInJsonContent } from './dubDependencyParser';

import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration,
  clearDecorations
} from 'editor/decorations';

const path = require('path');

export class DubCodeLensProvider extends AbstractCodeLensProvider {

  constructor() {
    super();
    this._outdatedCache = [];
    this._documentPath = '';
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/{dub.json,dub.selections.json}',
      group: ['statuses'],
    };
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return;

    this._documentPath = path.dirname(document.uri.fsPath);

    const dependencyNodes = findNodesInJsonContent(
      document.getText(),
      appContrib.dubDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appContrib
    );

    if (packageCollection.length === 0)
      return [];

    appSettings.inProgress = true;
    return this.updateOutdated()
      .then(_ => {
        appSettings.inProgress = false;
        return generateCodeLenses(packageCollection, document)
      })
      .catch(err => {
        appSettings.inProgress = false;
        console.log(err)
      });

  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.createMatchesLatestVersionCommand(codeLens);

    if (codeLens.package.version === '~master')
      return CommandFactory.createMatchesLatestVersionCommand(codeLens);

    // generate decoration
    if (appSettings.showDependencyStatuses)
      this.generateDecoration(codeLens);

    return dubGetPackageLatest(codeLens.package.name)
      .then(verionStr => {
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

  // get the outdated packages and cache them
  updateOutdated() {
    const selectionsFilePath = path.join(this._documentPath, 'dub.selections.json');
    return readDubSelections(selectionsFilePath)
      .then(selectionsJson => {
        this._outdatedCache = selectionsJson;
      })
      .catch(err => {
        if (err)
          console.warn(err);
      })
  }

  generateDecoration(codeLens) {
    const currentPackageName = codeLens.package.name;
    const currentPackageVersion = codeLens.package.version;

    if (!codeLens.replaceRange)
      return;

    if (!this._outdatedCache) {
      renderMissingDecoration(codeLens.replaceRange);
      return;
    }

    const currentVersion = this._outdatedCache.versions[currentPackageName];
    if (!currentVersion) {
      renderMissingDecoration(codeLens.replaceRange);
      return;
    }

    if (formatWithExistingLeading(currentPackageVersion, currentVersion) == currentPackageVersion) {
      renderInstalledDecoration(
        codeLens.replaceRange,
        currentPackageVersion
      );
      return;
    }

    renderOutdatedDecoration(
      codeLens.replaceRange,
      currentVersion
    );

  }
}