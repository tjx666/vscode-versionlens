// vscode references
import * as VsCodeTypes from 'vscode';

import { extractPackageDependenciesFromJson } from 'core/packages';

// imports
import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration,
  renderNeedsUpdateDecoration,
  renderPrereleaseInstalledDecoration
} from 'presentation/extension';

import {
  AbstractVersionLensProvider,
  VersionLensFetchResponse,
  VersionLensFactory,
  VersionLens
} from 'presentation/lenses';

import { PacoteClient } from './clients/pacoteClient';
import { npmGetOutdated, npmPackageDirExists } from './clients/npmClient';
import { NpmConfig } from './config';
import { npmReplaceVersion } from './npmVersionUtils';
import { ILogger } from 'core/logging';

export class NpmVersionLensProvider
  extends AbstractVersionLensProvider<NpmConfig> {

  _outdatedCache: Array<any>;

  pacoteClient: PacoteClient;

  constructor(
    pacoteClient: PacoteClient,
    config: NpmConfig,
    logger: ILogger
  ) {
    super(config, logger);
    this._outdatedCache = [];

    this.pacoteClient = pacoteClient;
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
      client: this.pacoteClient,
      clientData: this.config,
      logger: this.logger,
      replaceVersion: npmReplaceVersion
    }

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      context
    );
  }

  // get the outdated packages and cache them
  async updateOutdated(packagePath: string): Promise<any> {
    return npmGetOutdated(packagePath)
      .then(results => this._outdatedCache = results)
      .catch(err => {
        console.log("npmGetOutdated", err);
      });
  }

  generateDecoration(versionLens: VersionLens) {
    const documentPath = versionLens.package.requested.path;
    const currentPackageName = versionLens.package.requested.name;

    const packageDirExists = npmPackageDirExists(documentPath, currentPackageName);
    if (!packageDirExists) {
      renderMissingDecoration(
        versionLens.replaceRange,
        this.config.extension.statuses.notInstalledColour
      );
      return;
    }

    Promise.resolve(this._outdatedCache)
      .then(outdated => {
        const findIndex = outdated.findIndex(
          (entry: any) => entry.name === currentPackageName
        );

        if (findIndex === -1) {
          renderInstalledDecoration(
            versionLens.replaceRange,
            versionLens.package.requested.version,
            this.config.extension.statuses.installedColour
          );
          return;
        }

        const current = outdated[findIndex].current;
        const entered = versionLens.package.requested.version;

        // no current means no install at all
        if (!current) {
          renderMissingDecoration(
            versionLens.replaceRange,
            this.config.extension.statuses.notInstalledColour
          );
          return;
        }

        // if npm current and the entered version match it's installed
        if (current === entered) {

          if (versionLens.matchesLatestVersion())
            // up to date
            renderInstalledDecoration(
              versionLens.replaceRange,
              current,
              this.config.extension.statuses.installedColour
            );
          else if (versionLens.matchesPrereleaseVersion())
            // ahead of latest
            renderPrereleaseInstalledDecoration(
              versionLens.replaceRange,
              entered,
              this.config.extension.statuses.prereleaseInstalledColour
            );
          else
            // out of date
            renderOutdatedDecoration(
              versionLens.replaceRange,
              current,
              this.config.extension.statuses.outdatedColour
            );

          return;
        }

        // signal needs update
        renderNeedsUpdateDecoration(
          versionLens.replaceRange,
          current,
          this.config.extension.statuses.outdatedColour
        );

      })
      .catch(console.error);

  }

} // End NpmCodeLensProvider
