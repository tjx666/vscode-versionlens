import appContrib from '../../../appContrib';
import appSettings from '../../../appSettings';
import { formatWithExistingLeading } from '../../../common/utils';
import { extractPackageLensDataFromText } from 'core/packages/parsers/jsonPackageParser';
import { readComposerSelections } from 'core/providers/composer/composerClientApi';
import { renderMissingDecoration, renderInstalledDecoration, renderOutdatedDecoration } from 'presentation/editor/decorations';
import { AbstractCodeLensProvider } from 'presentation/lenses/definitions/abstractCodeLensProvider';
import { createCodeLenses } from 'presentation/lenses/factories/codeLensFactory';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { resolveComposerPackage } from './composerPackageResolver';

const path = require('path');

export class ComposerCodeLensProvider extends AbstractCodeLensProvider {

  _outdatedCache: {};

  packagePath: '';

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

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false) return [];

    this.packagePath = path.dirname(document.uri.fsPath);

    const packageDepsLenses = extractPackageLensDataFromText(document.getText(), appContrib.composerDependencyProperties);
    if (packageDepsLenses.length === 0) return [];

    const packageLensResolvers = PackageLensFactory.createPackageLensResolvers(
      this.packagePath,
      packageDepsLenses,
      resolveComposerPackage
    );
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;
    return this.updateOutdated()
      .then(_ => {
        appSettings.inProgress = false;
        return createCodeLenses(packageLensResolvers, document);
      })
      .catch(err => {
        appSettings.inProgress = false;
        console.log(err);
      });
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
      return PackageLensFactory.createUnexpectedError(codeLens.package.name, respObj.statusMessage);
    });

}

    */

  updateOutdated() {
    const selectionsFilePath = path.join(this.packagePath, 'composer.lock');
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
