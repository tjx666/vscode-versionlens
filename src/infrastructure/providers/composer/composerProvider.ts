// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core/logging';
import { VersionHelpers, extractPackageDependenciesFromJson, RequestFactory } from 'core/packages';

import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration
} from 'presentation/extension';
import { VersionLens } from 'presentation/lenses';
import { VersionLensFetchResponse, AbstractVersionLensProvider } from 'presentation/providers';

import { ComposerConfig } from 'providers/composer/composerConfig';
import { readComposerSelections, ComposerClient } from 'providers/composer/composerClient';

export class ComposerVersionLensProvider extends AbstractVersionLensProvider<ComposerConfig> {

  _outdatedCache: {};

  composerClient: ComposerClient;

  constructor(config: ComposerConfig, logger: ILogger) {
    super(config, logger);

    const requestOptions = {
      caching: config.caching,
      http: config.http
    };

    this.composerClient = new ComposerClient(
      config,
      requestOptions,
      logger.child({ namespace: 'composer pkg client' })
    );
  }

  async fetchVersionLenses(
    packagePath: string,
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
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
      this.composerClient,
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
