// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ComposerConfig } from 'providers/composer/config';

import {
  VersionHelpers,
  extractPackageDependenciesFromJson
} from 'core/packages';

import {
  readComposerSelections,
  ComposerClient
} from 'providers/composer/composerClient';

import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration
} from 'presentation/extension';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse,
  VersionLensFactory,
  VersionLens
} from 'presentation/lenses';

import { ILogger } from 'core/logging';

export class ComposerVersionLensProvider
  extends AbstractVersionLensProvider<ComposerConfig> {

  _outdatedCache: {};

  composerClient: ComposerClient;

  constructor(
    composerClient: ComposerClient,
    config: ComposerConfig,
    logger: ILogger
  ) {
    super(config, logger);
    this.composerClient = composerClient;
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      includePrereleases,
      clientData: null,
    }

    return VersionLensFactory.createVersionLenses(
      this.composerClient,
      document,
      packageDepsLenses,
      context,
    );
  }

  async updateOutdated(packagePath: string): Promise<any> {
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

    if (!versionLens.replaceRange) return;

    if (!this._outdatedCache) {
      renderMissingDecoration(
        versionLens.replaceRange,
        this.config.extension.statuses.notInstalledColour
      );
      return;
    }

    const currentVersion = this._outdatedCache[currentPackageName];
    if (!currentVersion) {
      renderMissingDecoration(
        versionLens.replaceRange,
        this.config.extension.statuses.notInstalledColour
      );
      return;
    }

    if (VersionHelpers.formatWithExistingLeading(currentPackageVersion, currentVersion) == currentPackageVersion) {
      renderInstalledDecoration(
        versionLens.replaceRange,
        currentPackageVersion,
        this.config.extension.statuses.installedColour
      );
      return;
    }

    renderOutdatedDecoration(
      versionLens.replaceRange,
      currentVersion,
      this.config.extension.statuses.outdatedColour
    );
  }

}
