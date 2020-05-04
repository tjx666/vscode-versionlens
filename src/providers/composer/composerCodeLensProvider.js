import * as CommandFactory from 'commands/factory';
import appContrib from 'common/appContrib';
import appSettings from 'common/appSettings';
import { formatWithExistingLeading } from 'common/utils';
import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration
} from 'editor/decorations';
import { AbstractCodeLensProvider } from 'providers/abstract/abstractCodeLensProvider';
import { resolvePackageLensData } from 'providers/shared/dependencyParser';
import { extractPackageLensDataFromText } from 'providers/shared/jsonPackageParser'
import { generateCodeLenses } from 'providers/shared/codeLensGeneration';
import { composerGetPackageLatest, readComposerSelections } from './composerAPI';


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
    if (appSettings.showVersionLenses === false) return [];

    this._documentPath = path.dirname(document.uri.fsPath);

    const packageLensData = extractPackageLensDataFromText(document.getText(), appContrib.composerDependencyProperties);
    if (packageLensData.length === 0) return [];

    const packageLensResolvers = resolvePackageLensData(packageLensData, appContrib);
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return this.updateOutdated()
      .then(_ => {
        appSettings.inProgress = false;
        return generateCodeLenses(packageLensResolvers, document);
      })
      .catch(err => {
        appSettings.inProgress = false;
        console.log(err);
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
    const selectionsFilePath = path.join(this._documentPath, 'composer.lock');
    return readComposerSelections(selectionsFilePath)
      .then(selectionsJson => {

        let packages = {};

        for (let onepackage in selectionsJson.packages) {
          packages[selectionsJson.packages[onepackage].name] = selectionsJson.packages[onepackage].version;
        }

        this._outdatedCache = packages;
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

    const currentVersion = this._outdatedCache[currentPackageName];
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
