// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import ComposerConfig from 'providers/composer/config';
import {
  VersionHelpers,
  extractPackageDependenciesFromJson
} from 'core/packages';
import { readComposerSelections, fetchComposerPackage } from 'providers/composer/composerApiClient';
import { renderMissingDecoration, renderInstalledDecoration, renderOutdatedDecoration } from 'presentation/editor/decorations';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { VersionLens } from 'presentation/lenses/models/versionLens';

export class ComposerCodeLensProvider extends AbstractVersionLensProvider {

  _outdatedCache: {};

  constructor() {
    super(ComposerConfig);
  }

  fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractPackageDependenciesFromJson(
      document.getText(),
      ComposerConfig.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      this.logger,
      fetchComposerPackage,
      null
    );
  }

  updateOutdated(packagePath: string): Promise<any> {
    const { join } = require('path')
    const selectionsFilePath = join(packagePath, 'composer.lock');
    return readComposerSelections(selectionsFilePath)
      .then((selectionsJson: any) => {

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

  generateDecorations(versionLens: VersionLens) {
    const currentPackageName = versionLens.package.requested.name;
    const currentPackageVersion = versionLens.package.requested.version;

    if (!versionLens.replaceRange)
      return;

    if (!this._outdatedCache) {
      renderMissingDecoration(versionLens.replaceRange);
      return;
    }

    const currentVersion = this._outdatedCache[currentPackageName];
    if (!currentVersion) {
      renderMissingDecoration(versionLens.replaceRange);
      return;
    }

    if (VersionHelpers.formatWithExistingLeading(currentPackageVersion, currentVersion) == currentPackageVersion) {
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
