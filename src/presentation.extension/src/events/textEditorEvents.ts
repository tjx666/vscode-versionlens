// vscode references
import * as VsCodeTypes from 'vscode';

import { ILogger } from 'core.logging';
import { providerRegistry } from 'presentation.providers';
import { ProviderSupport } from 'presentation.providers';
import { VersionLensState } from '../versionLensState';

export class TextEditorEvents {

  state: VersionLensState;

  logger: ILogger;

  constructor(extensionState: VersionLensState, logger: ILogger) {
    this.state = extensionState;
    this.logger = logger;

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

    const providersMatchingFilename = providerRegistry.getByFileName(
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

let _singleton = null;
export default _singleton;

export function registerTextEditorEvents(
  extensionState: VersionLensState, extLogger: ILogger
): TextEditorEvents {
  _singleton = new TextEditorEvents(extensionState, extLogger);
  return _singleton;
}