import { onActiveEditorChanged, onChangeTextDocument } from './handlers';

export default function () {
  const { window, workspace } = require('vscode');

  // update versionLens.isActive upon start
  onActiveEditorChanged(window.activeTextEditor);
  window.onDidChangeActiveTextEditor(editor => {
    // update versionLens.isActive each time the active editor changes
    onActiveEditorChanged(editor);
  });

  workspace.onDidChangeTextDocument(onChangeTextDocument);
}