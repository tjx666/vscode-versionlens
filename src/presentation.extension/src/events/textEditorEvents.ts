// vscode references
import * as VsCodeTypes from 'vscode';

import { ILogger } from 'core.logging';
import { ProviderSupport } from 'core.providers';

import { ProviderRegistry } from 'presentation.providers';

import { VersionLensState } from '../versionLensState';

export class TextEditorEvents {

  state: VersionLensState;

  logger: ILogger;

  providerRegistry: ProviderRegistry;

  constructor(
    state: VersionLensState,
    registry: ProviderRegistry,
    logger: ILogger
  ) {
    this.state = state;
    this.logger = logger;
    this.providerRegistry = registry;

    // register editor events
    const { window } = require('vscode');
    window.onDidChangeActiveTextEditor(
      this.onDidChangeActiveTextEditor.bind(this)
    );
  }

  onDidChangeActiveTextEditor(textEditor: VsCodeTypes.TextEditor) {
    // maintain versionLens.providerActive state
    // each time the active editor changes

    if (!textEditor) {
      // disable icons when no editor
      this.state.providerActive.value = false;
      return;
    }

    if (textEditor.document.uri.scheme !== 'file') return;

    const providersMatchingFilename = this.providerRegistry.getByFileName(
      textEditor.document.fileName
    );

    if (providersMatchingFilename.length === 0) {
      // disable icons if no match found
      this.state.providerActive.value = false;
      return;
    }

    // determine prerelease support
    const providerSupportsPrereleases = providersMatchingFilename.reduce(
      (v, p) => p.config.options.supports.includes(ProviderSupport.Prereleases)
      , false
    );

    // determine installed statuses support
    const providerSupportsInstalledStatuses = providersMatchingFilename.reduce(
      (v, p) => p.config.options.supports.includes(ProviderSupport.InstalledStatuses)
      , false
    );

    this.state.providerSupportsPrereleases.value = providerSupportsPrereleases;
    this.state.providerSupportsInstalledStatuses.value = providerSupportsInstalledStatuses;
    this.state.providerActive.value = true;
  }

}