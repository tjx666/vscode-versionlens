// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { extractPackageDependenciesFromJson, VersionHelpers } from 'core/packages';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse,
  VersionLensFactory,
  VersionLens
} from 'presentation/lenses';

import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration
} from 'presentation/editor/decorations';

import { DubConfig } from 'providers/dub/config';

import { readDubSelections, DubClient } from 'providers/dub/clients/dubClient';
import { ILogger } from 'core/generic/logging';

export class DubVersionLensProvider extends AbstractVersionLensProvider<DubConfig> {

  _outdatedCache: any;

  dubClient: DubClient;

  constructor(
    dubClient: DubClient,
    config: DubConfig,
    logger: ILogger
  ) {
    super(config, logger);
    this._outdatedCache = {};

    this.dubClient = dubClient;
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
      providerName: this.config.providerName,
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