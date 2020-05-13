// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { extractPackageDependenciesFromJson } from 'core/packages/parsers/jsonPackageParser';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration
} from 'presentation/editor/decorations';
import DubConfig from 'providers/dub/config';
import { fetchDubPackage, readDubSelections } from 'providers/dub/dubApiClient';
import { formatWithExistingLeading } from 'core/packages/helpers/versionHelpers';
import { VersionLens } from 'presentation/lenses/models/versionLens';

export class DubCodeLensProvider extends AbstractVersionLensProvider {

  _outdatedCache: any;

  constructor() {
    super(DubConfig);
    this._outdatedCache = {};
  }

  fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {
    const packageDepsLenses = extractPackageDependenciesFromJson(
      document.getText(),
      DubConfig.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      this.logger,
      fetchDubPackage,
      null
    );
  }

  // get the outdated packages and cache them
  updateOutdated(packagePath: string): Promise<any> {
    const path = require('path');
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

  generateDecoration(versionLens: VersionLens) {
    const currentPackageName = versionLens.package.requested.name;
    const currentPackageVersion = versionLens.package.requested.version;

    if (!versionLens.replaceRange)
      return;

    if (!this._outdatedCache) {
      renderMissingDecoration(versionLens.replaceRange);
      return;
    }

    const currentVersion = this._outdatedCache.versions[currentPackageName];
    if (!currentVersion) {
      renderMissingDecoration(versionLens.replaceRange);
      return;
    }

    if (formatWithExistingLeading(currentPackageVersion, currentVersion) == currentPackageVersion) {
      renderInstalledDecoration(
        versionLens.replaceRange,
        currentPackageVersion
      );
      return;
    }

    renderOutdatedDecoration(
      versionLens.replaceRange,
      currentVersion
    );

  }

}