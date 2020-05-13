import versionlensProviders from '../providers/versionlensProviders'
import { onActiveEditorChanged, onChangeTextDocument } from './handlers';

const { window, workspace } = require('vscode');

export default function () {
  // update versionLens.isActive upon start
  onActiveEditorChanged(window.activeTextEditor, versionlensProviders);
  window.onDidChangeActiveTextEditor(editor => {
    // update versionLens.isActive each time the active editor changes
    onActiveEditorChanged(editor, versionlensProviders);
  });

  workspace.onDidChangeTextDocument(onChangeTextDocument);
}