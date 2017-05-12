/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { npmVersionParser } from './npmVersionParser';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';
import {
  npmViewVersion,
  npmGetOutdated,
  npmPackageDirExists
} from './npmAPI';
import { extractDependencyNodes, parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';
import { window, Range, Position } from 'vscode';
import {
  createMissingDecoration,
  createInstalledDecoration,
  createOutdatedDecoration,
  updateDecoration,
  clearDecorations
} from '../../editor/decorations';
import * as path from 'path';

export class NpmCodeLensProvider extends AbstractCodeLensProvider {

  _outdatedCache = [];
  _documentPath = '';

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json'
    }
  }

  provideCodeLenses(document, token) {
    clearDecorations();

    if (appSettings.showVersionLenses === false)
      return;

    this._documentPath = path.dirname(document.uri.fsPath);

    const jsonDoc = jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const dependencyNodes = extractDependencyNodes(
      jsonDoc.root,
      appConfig.npmDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig,
      npmVersionParser
    );

    appSettings.inProgress = true;
    return this.updateOutdated()
      .then(_ => {
        appSettings.inProgress = false;
        return generateCodeLenses(packageCollection, document)
      });
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.package.version === 'latest')
      return CommandFactory.makeLatestCommand(codeLens);

    if (codeLens.package.meta) {
      if (codeLens.package.meta.type === 'github')
        return CommandFactory.makeGithubCommand(codeLens);

      if (codeLens.package.meta.type === 'file')
        return CommandFactory.makeLinkCommand(codeLens);
    }

    const viewPackageName = codeLens.package.name + (
      (!codeLens.package.meta.isValidSemver || codeLens.package.meta.isFixedVersion == false) ?
        `@${codeLens.package.version}` :
        ''
    );

    return npmViewVersion(this._documentPath, viewPackageName)
      .then(remoteVersion => {
        // check if this is a dist tag
        if (codeLens.isTaggedVersion())
          return CommandFactory.makeTaggedVersionCommand(codeLens);

        // check if this is a fixed version
        if (codeLens.isFixedVersion())
          return CommandFactory.makeFixedVersionCommand(codeLens);

        // check that a version was returned by npm view
        if (remoteVersion === '')
          return CommandFactory.makeErrorCommand(
            `'${viewPackageName}' not found`,
            codeLens
          );

        if (codeLens.package.meta.isValidSemver)
          return CommandFactory.makeVersionCommand(
            codeLens.package.version,
            remoteVersion,
            codeLens
          );

        if (!remoteVersion)
          return CommandFactory.makeErrorCommand(
            `${viewPackageName} gave an invalid response`,
            codeLens
          );

        return CommandFactory.makeTagCommand(`${viewPackageName} = v${remoteVersion}`, codeLens);
      })
      .catch(error => {
        // dont show errors for tagged versions
        // otherwise it will render multiple times in the codelens
        if (codeLens.isTaggedVersion())
          return;

        if (codeLens.package.version == 'E404') {
          return CommandFactory.makeErrorCommand(
            `${codeLens.package.name} could not be found`,
            codeLens
          );
        }

        console.error(error);
        return CommandFactory.makeErrorCommand(
          "An error occurred retrieving this package.",
          codeLens
        );

      });
  }

  // get the outdated packages and cache them
  updateOutdated() {
    return npmGetOutdated(this._documentPath)
      .then(results => this._outdatedCache = results)
  }

  generateDecoration(codeLens) {
    const activeEditor = window.activeTextEditor;
    const documentPath = this._documentPath;
    const currentPackageName = codeLens.package.name;

    const packageDirExists = npmPackageDirExists(documentPath, currentPackageName);
    if (!packageDirExists) {
      updateDecoration(createMissingDecoration(codeLens.range));
      return;
    }

    Promise.resolve(this._outdatedCache)
      .then(outdated => {
        const findIndex = outdated.findIndex(
          entry => entry.name === currentPackageName
        );

        if (findIndex === -1) {
          updateDecoration(createInstalledDecoration(codeLens.range));
          return;
        }

        if (!outdated[findIndex].current) {
          updateDecoration(createMissingDecoration(codeLens.range));
          return;
        }

        updateDecoration(
          createOutdatedDecoration(
            codeLens.range,
            outdated[findIndex].current
          )
        );
      })
      .catch(console.error);

  }

} // End NpmCodeLensProvider
