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
import NpmConfig from 'providers/npm/config';
import { extractPackageDependenciesFromJson } from 'core/packages/parsers/jsonPackageParser';
import { npmGetOutdated, npmPackageDirExists } from 'providers/npm/npmApiClient.js';
import { AbstractVersionLensProvider, VersionLensFetchResponse } from 'presentation/providers/abstract/abstractVersionLensProvider';
import * as VersionLensFactory from '../../presentation/lenses/factories/versionLensFactory';
import { fetchNpmPackage } from 'providers/npm/pacoteApiClient';

export class NpmCodeLensProvider extends AbstractVersionLensProvider {

  _outdatedCache: Array<any>;

  constructor(provider: string = NpmConfig.provider) {
    super(provider);
    this._outdatedCache = [];
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json',
      group: ['tags', 'statuses'],
    }
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
  /*
    generateDecoration(codeLens) {
      const documentPath = this.packagePath;
      const currentPackageName = codeLens.package.name;
  
      const packageDirExists = npmPackageDirExists(documentPath, currentPackageName);
      if (!packageDirExists) {
        renderMissingDecoration(codeLens.replaceRange);
        return;
      }
  
      Promise.resolve(this._outdatedCache)
        .then(outdated => {
          const findIndex = outdated.findIndex(
            (entry: any) => entry.name === currentPackageName
          );
  
          if (findIndex === -1) {
            renderInstalledDecoration(
              codeLens.replaceRange,
              codeLens.package.meta.tag.version
            );
            return;
          }
  
          const current = outdated[findIndex].current;
          const entered = codeLens.package.meta.tag.version;
  
          // no current means no install at all
          if (!current) {
            renderMissingDecoration(codeLens.replaceRange);
            return;
          }
  
          // if npm current and the entered version match it's installed
          if (current === entered) {
  
            if (codeLens.matchesLatestVersion())
              // up to date
              renderInstalledDecoration(
                codeLens.replaceRange,
                current
              );
            else if (codeLens.matchesPrereleaseVersion())
              // ahead of latest
              renderPrereleaseInstalledDecoration(
                codeLens.replaceRange,
                entered
              );
            else
              // out of date
              renderOutdatedDecoration(
                codeLens.replaceRange,
                current
              );
  
            return;
          }
  
          // signal needs update
          renderNeedsUpdateDecoration(
            codeLens.replaceRange,
            current
          );
  
        })
        .catch(console.error);
  
    }
  */
} // End NpmCodeLensProvider
