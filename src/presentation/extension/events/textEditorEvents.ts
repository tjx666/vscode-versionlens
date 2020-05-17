// vscode references
import * as VsCodeTypes from 'vscode';
import { providerRegistry } from 'presentation/providers';
import { VersionLensState } from '../versionLensState';

export class TextEditorEvents {

  state: VersionLensState;

  constructor(extensionState: VersionLensState) {
    this.state = extensionState;

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
      this.state.providerActive.value = false;
      return;
    }

    // clearDecorations();

    if (!textEditor.document) {
      this.state.providerActive.value = false;
      return;
    }

    if (providerRegistry.getByFileName(textEditor.document.fileName)) {
      this.state.providerActive.value = true;
      return;
    }

    this.state.providerActive.value = false;
  }

}

let _singleton = null;
export default _singleton;

export function registerTextEditorEvents(
  extensionState: VersionLensState
): TextEditorEvents {
  _singleton = new TextEditorEvents(extensionState);
  return _singleton;
}