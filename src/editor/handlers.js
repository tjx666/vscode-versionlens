import * as path from 'path';
import * as minimatch from 'minimatch';
import appSettings from '../common/appSettings';

export function onActiveEditorChanged(editor, providers) {
  if (!editor || !editor.document) {
    appSettings.isActive = false;
    return;
  }

  const filename = path.basename(editor.document.fileName);
  for (var i = 0; i < providers.length; i++) {
    if (minimatch(filename, providers[i].selector.pattern)) {
      appSettings.isActive = true;
      return;
    }
  }

  appSettings.isActive = false;
}