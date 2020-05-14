// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { extractPackageDependenciesFromJson, VersionHelpers } from 'core/packages';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse
} from 'presentation/providers/abstract/abstractVersionLensProvider';

import { VersionLensFactory, VersionLens } from 'presentation/lenses';

import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration
} from 'presentation/editor/decorations';

import { DubConfig } from 'providers/dub/config';

import { readDubSelections, DubClient } from 'providers/dub/clients/dubClient';

export class DubVersionLensProvider extends AbstractVersionLensProvider<DubConfig> {

  _outdatedCache: any;

  dubClient: DubClient;

  constructor(config) {
    super(config);
    this._outdatedCache = {};

    this.dubClient = new DubClient(config, 0);
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
      client: this.dubClient,
      clientData: this.config,
      logger: this.logger,
    }

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      context,
    );
  }

  // get the outdated packages and cache them
  async updateOutdated(packagePath: string): Promise<any> {
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