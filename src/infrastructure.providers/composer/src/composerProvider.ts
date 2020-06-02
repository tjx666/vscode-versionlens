import * as VsCodeTypes from 'vscode';

import { ILogger } from 'core.logging';
import {
  VersionHelpers,
  extractPackageDependenciesFromJson,
  RequestFactory
} from 'core.packages';

import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration,
  VersionLensExtension
} from 'presentation.extension';
import { VersionLens } from 'presentation.lenses';
import { VersionLensFetchResponse, AbstractVersionLensProvider } from 'presentation.providers';

import { ComposerConfig } from './composerConfig';
import { readComposerSelections, ComposerClient } from './composerClient';

export class ComposerVersionLensProvider
  extends AbstractVersionLensProvider<ComposerConfig> {

  _outdatedCache: {};

  client: ComposerClient;

  constructor(
    extension: VersionLensExtension,
    client: ComposerClient,
    logger: ILogger
  ) {
    super(extension, client.config, logger);
    this.client = client;
  }

  async fetchVersionLenses(
    packagePath: string, document: VsCodeTypes.TextDocument
  ): VersionLensFetchResponse {

    const packageDependencies = extractPackageDependenciesFromJson(
      document.getText(),
      this.config.dependencyProperties
    );
    if (packageDependencies.length === 0) return null;

    const includePrereleases = this.extension.state.prereleasesEnabled.value;

    const context = {
      includePrereleases,
      clientData: null,
    }

    return RequestFactory.executeDependencyRequests(
      packagePath,
      this.client,
      packageDependencies,
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
        this.extension.statuses.notInstalledColour
      );
      return;
    }

    const currentVersion = this._outdatedCache[currentPackageName];
    if (!currentVersion) {
      renderMissingDecoration(
        versionLens.replaceRange,
        this.extension.statuses.notInstalledColour
      );
      return;
    }

    if (VersionHelpers.formatWithExistingLeading(currentPackageVersion, currentVersion) == currentPackageVersion) {
      renderInstalledDecoration(
        versionLens.replaceRange,
        currentPackageVersion,
        this.extension.statuses.installedColour
      );
      return;
    }

    renderOutdatedDecoration(
      versionLens.replaceRange,
      currentVersion,
      this.extension.statuses.outdatedColour
    );
  }

}
