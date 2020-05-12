// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import appContrib from '../../../appContrib';
import { formatWithExistingLeading } from '../../../common/utils';
import { extractPackageLensDataFromText } from 'core/packages/parsers/jsonPackageParser';
import { readDubSelections } from 'core/providers/dub/dubApiClient';
import { renderMissingDecoration, renderInstalledDecoration, renderOutdatedDecoration } from 'presentation/editor/decorations';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/lenses/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { resolveDubPackage } from './dubPackageResolver';
import { VersionLens } from 'presentation/lenses/models/versionLens';

export class DubCodeLensProvider extends AbstractVersionLensProvider {

  _outdatedCache: any;

  constructor() {
    super();
    this._outdatedCache = {};
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/{dub.json,dub.selections.json}',
      group: ['statuses'],
    };
  }

  fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractPackageLensDataFromText(document.getText(), appContrib.dubDependencyProperties);
    if (packageDepsLenses.length === 0) return Promise.resolve([]);

    return VersionLensFactory.createVersionLenses(
      packagePath,
      document,
      packageDepsLenses,
      resolveDubPackage
    );
  }

  updateOutdated(packagePath: string) { }

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

  // get the outdated packages and cache them
  updateOutdated(packagePath: string) {
    const selectionsFilePath = path.join(packagePath, 'dub.selections.json');
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


  
    */
}