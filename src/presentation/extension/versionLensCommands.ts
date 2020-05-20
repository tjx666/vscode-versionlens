// vscode references
import * as VsCodeTypes from 'vscode';

import { ILogger } from 'core/logging';
import { PackageSourceTypes } from 'core/packages';
import { providerRegistry } from 'presentation/providers';

import { VersionLensExtension } from "./versionLensExtension";
import * as InstalledStatusHelpers from './helpers/installedStatusHelpers';
import { VersionLensState } from './versionLensState';
import { VersionLens } from 'presentation/lenses/versionLens';

export enum CommandContributions {
  ShowInstalledStatuses = 'versionlens.onShowInstalledStatuses',
  HideInstalledStatuses = 'versionlens.onHideInstalledStatuses',
  ShowPrereleaseVersions = 'versionlens.onShowPrereleaseVersions',
  HidePrereleaseVersions = 'versionlens.onHidePrereleaseVersions',
  ShowVersionLenses = 'versionlens.onShowVersionLenses',
  HideVersionLenses = 'versionlens.onHideVersionLenses',
  UpdateDependencyCommand = 'versionlens.onUpdateDependencyCommand',
  LinkCommand = "versionlens.onLinkCommand"
}

export class VersionLensCommands {

  logger: ILogger;

  state: VersionLensState;

  constructor(extensionState: VersionLensState, logger: ILogger) {
    this.logger = logger;
    this.state = extensionState;
  }

  onShowVersionLenses(resourceUri: VsCodeTypes.Uri) {
    this.state.enabled.change(true)
      .then(_ => {
        providerRegistry.refreshActiveCodeLenses();
      });
  }

  onHideVersionLenses(resourceUri: VsCodeTypes.Uri) {
    this.state.enabled.change(false)
      .then(_ => {
        providerRegistry.refreshActiveCodeLenses();
      });
  }

  onShowPrereleaseVersions(resourceUri: VsCodeTypes.Uri) {
    this.state.prereleasesEnabled.change(true)
      .then(_ => {
        providerRegistry.refreshActiveCodeLenses();
      });
  }

  onHidePrereleaseVersions(resourceUri: VsCodeTypes.Uri) {
    this.state.prereleasesEnabled.change(false)
      .then(_ => {
        providerRegistry.refreshActiveCodeLenses();
      });
  }

  onShowInstalledStatuses(resourceUri: VsCodeTypes.Uri) {
    this.state.installedStatusesEnabled.change(true)
      .then(_ => {
        providerRegistry.refreshActiveCodeLenses();
      });
  }

  onHideInstalledStatuses(resourceUri: VsCodeTypes.Uri) {
    this.state.installedStatusesEnabled.change(false)
      .then(_ => {
        InstalledStatusHelpers.clearDecorations();
      });
  }

  onUpdateDependencyCommand(codeLens: VersionLens, packageVersion: string) {
    if ((<any>codeLens).__replaced) return Promise.resolve();

    const { workspace, WorkspaceEdit } = require('vscode');
    const edit = new WorkspaceEdit();
    edit.replace(codeLens.documentUrl, codeLens.replaceRange, packageVersion);

    return workspace.applyEdit(edit)
      .then(done => (<any>codeLens).__replaced = true);
  }

  onLinkCommand(codeLens: VersionLens) {
    const path = require('path');
    const opener = require('opener');

    if (codeLens.package.source === PackageSourceTypes.Directory) {
      const filePathToOpen = path.resolve(
        path.dirname(codeLens.documentUrl.fsPath),
        codeLens.package.resolved.version
      );
      opener(filePathToOpen);
      return;
    }

    // opener(codeLens.package.remoteUrl);
  }

}

export function registerCommands(
  extension: VersionLensExtension, logger: ILogger
): Array<VsCodeTypes.Disposable> {

  const { commands } = require('vscode');

  const disposables = [];

  const extensionCommands = new VersionLensCommands(
    extension.state,
    logger
  );

  // loop enum keys
  Object.keys(CommandContributions)
    .forEach(enumKey => {

      // register command
      const command = CommandContributions[enumKey];
      const handler = extensionCommands[`on${enumKey}`];
      if (!handler) {
        // todo roll up errors to a semantic factory
        const msg = `Could not find %s handler on %s class`;
        logger.error(msg, command, VersionLensCommands.name)
        // just return here?
        throw new Error(`Could not find ${command} handler on ${VersionLensCommands.name} class`)
      }

      // collect disposables
      disposables.push(
        commands.registerCommand(
          command,
          handler.bind(extensionCommands)
        )
      )
    });

  return disposables;
}