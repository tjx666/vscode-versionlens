import appContrib from '../../../appContrib';
import appSettings from '../../../appSettings';
import { renderMissingDecoration, renderInstalledDecoration, renderOutdatedDecoration } from '../../editor/decorations';
import { formatWithExistingLeading } from '../../../common/utils';
import { resolvePackageLensData } from '../../../providers/shared/dependencyParser';
import { AbstractCodeLensProvider } from '../../lenses/definitions/abstractCodeLensProvider';
import { IVersionCodeLens } from "presentation/lenses/definitions/IVersionCodeLens";
import * as CodeLensFactory from 'presentation/lenses/factories/codeLensFactory';
import { extractPackageLensDataFromText } from 'core/packages/parsers/jsonPackageParser';
import { readDubSelections } from 'core/providers/dub/dubClientApi';
import { resolveDubPackage } from './dubPackageResolver';


const path = require('path');

export class DubCodeLensProvider extends AbstractCodeLensProvider {

  _outdatedCache: any;
  packagePath: '';

  constructor() {
    super();
    this._outdatedCache = {};
    this.packagePath = '';
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
    if (appSettings.showVersionLenses === false) return [];

    this.packagePath = path.dirname(document.uri.fsPath);

    const packageLensData = extractPackageLensDataFromText(document.getText(), appContrib.dubDependencyProperties);
    if (packageLensData.length === 0) return [];

    // TODO fix subPackages

    const packageDepsLenses = resolvePackageLensData(this.packagePath, packageLensData, resolveDubPackage);
    if (packageDepsLenses.length === 0) return [];

    appSettings.inProgress = true;
    return this.updateOutdated()
      .then(_ => {
        appSettings.inProgress = false;
        return CodeLensFactory.createCodeLenses(packageDepsLenses, document)
      })
      .catch(err => {
        appSettings.inProgress = false;
        console.log(err)
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
      if (response.status == 404) return CommandFactory.createPackageNotFoundCommand(codeLens);

      const respObj = JSON.parse(response.responseText);
      logPackageError(
        "Dub",
        "dubGetPackageLatest",
        codeLens.package.name,
        respObj.statusMessage
      );

      return CommandFactory.createPackageUnexpectedError(codeLens.package.name);
    });

}

    */
  // get the outdated packages and cache them
  updateOutdated() {
    const selectionsFilePath = path.join(this.packagePath, 'dub.selections.json');
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