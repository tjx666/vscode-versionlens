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
} from 'presentation/extension';

import { DubConfig } from 'providers/dub/config';

import { readDubSelections, DubClient } from 'providers/dub/clients/dubClient';
import { ILogger } from 'core/logging';

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
      this.dubClient,
      document,
      packageDepsLenses,
      context,
    );
  }

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

  generateDecorations(versionLens: VersionLens): void {
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

    const currentVersion = this._outdatedCache.versions[currentPackageName];
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