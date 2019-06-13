import * as CommandFactory from 'commands/factory';
import appContrib from 'common/appContrib';
import { generateCodeLenses } from 'common/codeLensGeneration';
import appSettings from 'common/appSettings';
import { parseDependencyNodes } from 'common/dependencyParser';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { composerGetPackageLatest, readComposerSelections } from './composerAPI';
import { findNodesInJsonContent } from './composerDependencyParser';

const path = require('path');

export class ComposerCodeLensProvider extends AbstractCodeLensProvider {

  constructor() {
    super();
    this._outdatedCache = [];
    this._documentPath = '';
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/composer.json',
      group: ['tags'],
    };
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return [];

    this._documentPath = path.dirname(document.uri.fsPath);

    const dependencyNodes = findNodesInJsonContent(
      document.getText(),
      appContrib.composerDependencyProperties
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

    return composerGetPackageLatest(codeLens.package.name)
      .then(versionStr => {
        if (typeof versionStr !== "string")
          return CommandFactory.createErrorCommand(
            "Invalid object returned from server",
            codeLens
          );

        return CommandFactory.createVersionCommand(
          codeLens.package.version,
          versionStr,
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

  updateOutdated() {
    const selectionsFilePath = path.join(this._documentPath, 'composer.json');
    return readComposerSelections(selectionsFilePath)
      .then(selectionsJson => {
        this._outdatedCache = selectionsJson;
      })
      .catch(err => {
        if (err)
          console.warn(err);
      })
  }
}
