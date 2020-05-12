// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appContrib from '../../../appContrib';
import { formatWithExistingLeading } from '../../../common/utils';
import { extractPackageLensDataFromText } from 'core/packages/parsers/jsonPackageParser';
import { readComposerSelections } from 'core/providers/composer/composerApiClient';
import { renderMissingDecoration, renderInstalledDecoration, renderOutdatedDecoration } from 'presentation/editor/decorations';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/lenses/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { resolveComposerPackage } from './composerPackageResolver';

export class ComposerCodeLensProvider extends AbstractVersionLensProvider {

  _outdatedCache: {};

  constructor() {
    super();
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/composer.json',
      group: ['tags'],
    };
  }

  fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractPackageLensDataFromText(document.getText(), appContrib.composerDependencyProperties);
    if (packageDepsLenses.length === 0) return Promise.resolve([]);

    return VersionLensFactory.createVersionLenses(
      packagePath,
      document,
      packageDepsLenses,
      resolveComposerPackage
    );

  }


  /*
evaluateCodeLens(codeLens: IVersionCodeLens) {

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
      if (response.status == 404) return CommandFactory.createPackageNotFoundCommand(codeLens);

      const respObj = JSON.parse(response.responseText);
      logPackageError(
        "Composer",
        "composerGetPackageLatest",
        codeLens.package.name,
        respObj.statusMessage
      );
      return ResponseFactory.createUnexpectedError(codeLens.package.name, respObj.statusMessage);
    });

}

    */

  updateOutdated(packagePath: string) {
    const { join } = require('path')
    const selectionsFilePath = join(packagePath, 'composer.lock');
    return readComposerSelections(selectionsFilePath)
      .then(selectionsJson => {

        let packages = {};

        // for (let onepackage in selectionsJson.packages) {
        //   packages[selectionsJson.packages[onepackage].name] = selectionsJson.packages[onepackage].version;
        // }

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
