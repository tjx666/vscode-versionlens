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
} from 'presentation/editor/decorations';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation/providers/abstract/abstractVersionLensProvider';

import { VersionLensFactory, VersionLens } from 'presentation/lenses';

export class ComposerVersionLensProvider
  extends AbstractVersionLensProvider<ComposerConfig> {

  _outdatedCache: {};

  composerClient: ComposerClient;

  constructor(config: ComposerConfig) {
    super(config);

    // todo get cache durations from config
    this.composerClient = new ComposerClient(config, 0)
  }

  async fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    const context = {
      client: this.composerClient,
      clientData: this.config,
      logger: this.logger,
    }

    return VersionLensFactory.createVersionLenses(
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
