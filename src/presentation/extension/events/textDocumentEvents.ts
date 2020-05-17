// vscode references
import * as VsCodeTypes from 'vscode';
import { VersionLensState } from '../versionLensState';
import * as InstalledStatusHelpers from '../helpers/installedStatusHelpers';

export class TextDocumentEvents {

  state: VersionLensState;

  constructor(extensionState: VersionLensState) {
    this.state = extensionState;

    // register editor events
    const { workspace } = require('vscode');

    // register window and workspace events
    workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument.bind(this)
    );

  }

  onDidChangeTextDocument(changeEvent: VsCodeTypes.TextDocumentChangeEvent) {
    // ensure version lens is active
    if (this.state.providerActive.value === false) return;

    const foundDecorations = [];
    const { contentChanges } = changeEvent;

    // get all decorations for all the lines that have changed
    contentChanges.forEach(change => {
      const startLine = change.range.start.line;
      let endLine = change.range.end.line;

      if (change.text.charAt(0) == '\n' || endLine > startLine) {
        InstalledStatusHelpers.removeDecorationsFromLine(startLine)
        return;
      }

      for (let line = startLine; line <= endLine; line++) {
        const lineDecorations = InstalledStatusHelpers.getDecorationsByLine(line);
        if (lineDecorations.length > 0)
          foundDecorations.push(...lineDecorations);
      }
    })

    if (foundDecorations.length === 0) return;

    // remove all decorations that have changed
    InstalledStatusHelpers.removeDecorations(foundDecorations);
  }

}

let _singleton = null;
export default _singleton;

export function registerTextDocumentEvents(
  extensionState: VersionLensState
): TextDocumentEvents {

  _singleton = new TextDocumentEvents(extensionState);
  
  return _singleton;
}