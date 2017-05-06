import { window } from 'vscode';
import codeLensProviders from '../providers/codeLensProviders'
import { onActiveEditorChanged } from './handlers';

export default function () {
  // update versionLens.isActive upon start
  onActiveEditorChanged(window.activeTextEditor, codeLensProviders);
  window.onDidChangeActiveTextEditor(editor => {
    // update versionLens.isActive each time the active editor changes
    onActiveEditorChanged(editor, codeLensProviders);
  });
}