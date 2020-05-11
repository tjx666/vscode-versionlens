import appSettings from '../../../appSettings';
import appContrib from '../../../appContrib';
import {
  renderMissingDecoration,
  renderInstalledDecoration,
  renderOutdatedDecoration,
  renderNeedsUpdateDecoration,
  renderPrereleaseInstalledDecoration
} from 'presentation/editor/decorations';

import { AbstractCodeLensProvider } from 'presentation/lenses/definitions/abstractCodeLensProvider';
import { extractPackageLensDataFromText } from 'core/packages/parsers/jsonPackageParser';
import { npmGetOutdated, npmPackageDirExists } from 'core/providers/npm/npmClient.js';
import * as CodeLensFactory from '../../lenses/factories/codeLensFactory';
import * as PackageLensFactory from '../../lenses/factories/packageLensFactory';
import { resolveNpmPackage } from './npmPackageResolver';

export class NpmCodeLensProvider extends AbstractCodeLensProvider {
  _outdatedCache: Array<any>;

  packagePath: string = '';

  constructor() {
    super();
    this._outdatedCache = [];
    this.packagePath = '';
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json',
      group: ['tags', 'statuses'],
    }
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false) return [];

    const path = require('path');
    this.packagePath = path.dirname(document.uri.fsPath);

    // extract package lens data
    const packageDepsLenses = extractPackageLensDataFromText(document.getText(), appContrib.npmDependencyProperties)
    if (packageDepsLenses.length === 0) return [];

    // resolve package dependencies (as promises)
    const packageLensResolvers = PackageLensFactory.createPackageLensResolvers(
      this.packagePath,
      packageDepsLenses,
      resolveNpmPackage
    );
    if (packageLensResolvers.length === 0) return [];

    appSettings.inProgress = true;

    // create code lenses from package lenses
    return CodeLensFactory.createCodeLenses(packageLensResolvers, document)
      .then(codeLenses => {
        if (appSettings.showDependencyStatuses) {
          return this.updateOutdated()
            .then(_ => codeLenses)
        }

        return codeLenses;
      })
      .catch(err => {
        console.log(err)
      })
  }

  // get the outdated packages and cache them
  updateOutdated() {
    return npmGetOutdated(this.packagePath)
      .then(results => this._outdatedCache = results)
      .catch(err => {
        console.log("npmGetOutdated", err);
      });
  }

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

} // End NpmCodeLensProvider
