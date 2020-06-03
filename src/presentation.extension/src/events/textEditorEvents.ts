import { window, TextEditor } from 'vscode';

import { ProviderSupport } from 'core.providers';

import { ProviderRegistry } from 'presentation.providers';

import { VersionLensState } from '../versionLensState';
import { ILoggerTransport } from 'infrastructure.logging';

export class TextEditorEvents {

  state: VersionLensState;

  providerRegistry: ProviderRegistry;

  loggerTransport: ILoggerTransport;

  constructor(
    state: VersionLensState,
    registry: ProviderRegistry,
    loggerTransport: ILoggerTransport
  ) {
    this.state = state;
    this.providerRegistry = registry;
    this.loggerTransport = loggerTransport;

    // register editor events
    window.onDidChangeActiveTextEditor(
      this.onDidChangeActiveTextEditor.bind(this)
    );
  }

  onDidChangeActiveTextEditor(textEditor: TextEditor) {
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

    // ensure the latest logging level is set
    this.loggerTransport.updateLevel();

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