// vscode references
import * as VsCodeTypes from 'vscode';

import { ILogger } from 'core/logging';

import { providerRegistry } from 'presentation/providers';
import { CommandHelpers } from 'presentation/extension';

import { VersionLensExtension } from "../versionLensExtension";
import * as InstalledStatusHelpers from '../helpers/installedStatusHelpers';
import { VersionLensState } from '../versionLensState';

export enum IconCommandContributions {
  ShowError = 'versionlens.onShowError',
  ShowingProgress = 'versionlens.onShowingProgress',
  ShowInstalledStatuses = 'versionlens.onShowInstalledStatuses',
  HideInstalledStatuses = 'versionlens.onHideInstalledStatuses',
  ShowPrereleaseVersions = 'versionlens.onShowPrereleaseVersions',
  HidePrereleaseVersions = 'versionlens.onHidePrereleaseVersions',
  ShowVersionLenses = 'versionlens.onShowVersionLenses',
  HideVersionLenses = 'versionlens.onHideVersionLenses',
}

export class IconCommands {

  state: VersionLensState;

  extension: VersionLensExtension;

  constructor(extension: VersionLensExtension) {
    this.extension = extension
    this.state = extension.state;
  }

  onShowError(resourceUri: VsCodeTypes.Uri) {
    return Promise.all([
      this.state.providerError.change(false),
      this.state.providerBusy.change(0)
    ])
      .then(_ => {
        this.extension.outputChannel.show();
      });
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

  onShowingProgress(resourceUri: VsCodeTypes.Uri) { }

}

export function registerIconCommands(
  extension: VersionLensExtension, logger: ILogger
): Array<VsCodeTypes.Disposable> {

  const iconCommands = new IconCommands(extension);

  return CommandHelpers.registerCommands(
    IconCommandContributions,
    <any>iconCommands,
    logger
  );
}