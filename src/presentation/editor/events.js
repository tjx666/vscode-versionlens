import codeLensProviders from '../../providers/codeLensProviders'
import { onActiveEditorChanged, onChangeTextDocument } from './handlers';

const { window, workspace } = require('vscode');

export default function () {
  // update versionLens.isActive upon start
  onActiveEditorChanged(window.activeTextEditor, codeLensProviders);
  window.onDidChangeActiveTextEditor(editor => {
    // update versionLens.isActive each time the active editor changes
    onActiveEditorChanged(editor, codeLensProviders);
  });

  workspace.onDidChangeTextDocument(onChangeTextDocument);
}