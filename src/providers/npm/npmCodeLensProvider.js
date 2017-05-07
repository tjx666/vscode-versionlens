/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as jsonParser from 'vscode-contrib-jsonc';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { npmVersionParser } from './npmVersionParser';
import { appConfig } from '../../common/appConfiguration';
import * as CommandFactory from '../commandFactory';
import {
  npmViewVersion,
  npmGetOutdated,
  npmGetLocalPackageStatus,
  npmPackageDirExists
} from './npmAPI';
import { extractDependencyNodes, parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';
import appSettings from '../../common/appSettings';
import { window, Range, Position } from 'vscode';
import { createRenderOptions, updateDecoration } from '../../editor/decorations';
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

    return generateCodeLenses(packageCollection, document)
      .then(codeLenses => {
        // get the outdated packages and cache them
        this.updateOutdated();
        return codeLenses;
      });
  }

  resolveCodeLens(codeLens, token) {
    if (codeLens instanceof PackageCodeLens) {
      this.generateDecoration(codeLens);
      return this.evaluateCodeLens(codeLens);
    }
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
      (!codeLens.package.meta.isValidSemver || codeLens.package.meta.hasRangeSymbol) ?
        `@${codeLens.package.version}` :
        ''
    );

    return npmViewVersion(viewPackageName)
      .then(remoteVersion => {
        // check that a version was returned by npm view
        if (remoteVersion === '')
          return CommandFactory.makeErrorCommand(
            `'npm view ${viewPackageName} version' did not return any results`,
            codeLens
          );

        // check if this is a dist tag
        if (codeLens.isTaggedVersion())
          return CommandFactory.makeDistTagCommand(codeLens);

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
        console.error(error);
        return CommandFactory.makeErrorCommand(
          "An error occurred retrieving this package.",
          codeLens
        );
      });
  }

  updateOutdated() {
    return npmGetOutdated(this._documentPath)
      .then(results => this._outdatedCache = results);
  }

  generateDecoration(codeLens) {
    const activeEditor = window.activeTextEditor;
    const documentPath = this._documentPath;
    const currentPackageName = codeLens.package.name;

    const packageDirExists = npmPackageDirExists(documentPath, currentPackageName);
    if (!packageDirExists) {
      updateDecoration(createMissingDecoration(codeLens));
      return;
    }

    Promise.resolve(this._outdatedCache)
      .then(outdated => {
        const findIndex = outdated.findIndex(
          entry => entry.name === currentPackageName
        );

        if (findIndex === -1) {
          updateDecoration(createInstalledDecoration(codeLens));
          return;
        }

        if (!outdated[findIndex].current) {
          updateDecoration(createMissingDecoration(codeLens));
          return;
        }

        updateDecoration(createOutdatedDecoration(codeLens, outdated[findIndex].current));
      });

  }

} // End NpmCodeLensProvider

function createMissingDecoration(codeLens) {
  return {
    range: new Range(
      codeLens.range.start,
      new Position(codeLens.range.end.line, codeLens.range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(' ▪ missing install', 'rgba(255,0,0,0.5)')
    }
  };
}

function createInstalledDecoration(codeLens) {
  return {
    range: new Range(
      codeLens.range.start,
      new Position(codeLens.range.end.line, codeLens.range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(' ▪ latest installed', 'rgba(0,255,0,0.5)')
    }
  };
}

function createOutdatedDecoration(codeLens, installedVersion) {
  return {
    range: new Range(
      codeLens.range.start,
      new Position(codeLens.range.end.line, codeLens.range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(` ▪ ${installedVersion} installed`, 'rgba(255,255,0,0.5)')
    }
  };
}
