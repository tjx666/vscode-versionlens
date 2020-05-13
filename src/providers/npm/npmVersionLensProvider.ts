// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration,
  renderNeedsUpdateDecoration,
  renderPrereleaseInstalledDecoration
} from 'presentation/editor/decorations';

import { IProviderConfig } from "core/configuration/definitions";
import { extractPackageDependenciesFromJson } from 'core/packages';
import { npmGetOutdated, npmPackageDirExists } from 'providers/npm/npmApiClient.js';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from 'presentation/lenses/factories/versionLensFactory';
import { fetchNpmPackage } from 'providers/npm/pacoteApiClient';
import { VersionLens } from 'presentation/lenses/models/versionLens';
import NpmConfig from 'providers/npm/config';

export class NpmCodeLensProvider extends AbstractVersionLensProvider {

  _outdatedCache: Array<any>;

  constructor(config: IProviderConfig = NpmConfig) {
    super(config);
    this._outdatedCache = [];
  }

  fetchVersionLenses(
    document: VsCodeTypes.TextDocument,
    token: VsCodeTypes.CancellationToken
  ): VersionLensFetchResponse {

    const packageDepsLenses = extractPackageDependenciesFromJson(
      document.getText(),
      NpmConfig.getDependencyProperties()
    );
    if (packageDepsLenses.length === 0) return null;

    return VersionLensFactory.createVersionLenses(
      document,
      packageDepsLenses,
      this.logger,
      fetchNpmPackage,
      null
    );
  }

  // get the outdated packages and cache them
  updateOutdated(packagePath: string) {
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
      renderMissingDecoration(versionLens.replaceRange);
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
            versionLens.package.requested.version
          );
          return;
        }

        const current = outdated[findIndex].current;
        const entered = versionLens.package.requested.version;

        // no current means no install at all
        if (!current) {
          renderMissingDecoration(versionLens.replaceRange);
          return;
        }

        // if npm current and the entered version match it's installed
        if (current === entered) {

          if (versionLens.matchesLatestVersion())
            // up to date
            renderInstalledDecoration(
              versionLens.replaceRange,
              current
            );
          else if (versionLens.matchesPrereleaseVersion())
            // ahead of latest
            renderPrereleaseInstalledDecoration(
              versionLens.replaceRange,
              entered
            );
          else
            // out of date
            renderOutdatedDecoration(
              versionLens.replaceRange,
              current
            );

          return;
        }

        // signal needs update
        renderNeedsUpdateDecoration(
          versionLens.replaceRange,
          current
        );

      })
      .catch(console.error);

  }

} // End NpmCodeLensProvider
