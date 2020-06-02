// vscode references
import * as VsCodeTypes from 'vscode';
import { ILogger } from 'core.logging';

import { CommandHelpers } from 'presentation.extension';
import { ProviderRegistry } from 'presentation.providers';

import { IconCommandContributions } from '../definitions/eIconCommandContributions';
import * as InstalledStatusHelpers from '../helpers/installedStatusHelpers';
import { VersionLensState } from '../versionLensState';

export class IconCommands {

  state: VersionLensState;

  outputChannel: VsCodeTypes.OutputChannel;

  providerRegistry: ProviderRegistry;

  constructor(
    state: VersionLensState,
    outputChannel: VsCodeTypes.OutputChannel,
    providerRegistry: ProviderRegistry
  ) {
    this.state = state;
    this.outputChannel = outputChannel;
    this.providerRegistry = providerRegistry;
  }

  onShowError(resourceUri: VsCodeTypes.Uri) {
    return Promise.all([
      this.state.providerError.change(false),
      this.state.providerBusy.change(0)
    ])
      .then(_ => {
        this.outputChannel.show();
      });
  }

  onShowVersionLenses(resourceUri: VsCodeTypes.Uri) {
    this.state.enabled.change(true)
      .then(_ => {
        this.providerRegistry.refreshActiveCodeLenses();
      });
  }

  onHideVersionLenses(resourceUri: VsCodeTypes.Uri) {
    this.state.enabled.change(false)
      .then(_ => {
        this.providerRegistry.refreshActiveCodeLenses();
      });
  }

  onShowPrereleaseVersions(resourceUri: VsCodeTypes.Uri) {
    this.state.prereleasesEnabled.change(true)
      .then(_ => {
        this.providerRegistry.refreshActiveCodeLenses();
      });
  }

  onHidePrereleaseVersions(resourceUri: VsCodeTypes.Uri) {
    this.state.prereleasesEnabled.change(false)
      .then(_ => {
        this.providerRegistry.refreshActiveCodeLenses();
      });
  }

  onShowInstalledStatuses(resourceUri: VsCodeTypes.Uri) {
    this.state.installedStatusesEnabled.change(true)
      .then(_ => {
        this.providerRegistry.refreshActiveCodeLenses();
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
  state: VersionLensState,
  providerRegistry: ProviderRegistry,
  subscriptions: Array<VsCodeTypes.Disposable>,
  outputChannel: VsCodeTypes.OutputChannel,
  logger: ILogger
): IconCommands {

  // create the dependency
  const iconCommands = new IconCommands(
    state,
    outputChannel,
    providerRegistry
  );

  // register commands with vscode
  subscriptions.push(
    ...CommandHelpers.registerCommands(
      IconCommandContributions,
      <any>iconCommands,
      logger
    )
  )

  return iconCommands;
}