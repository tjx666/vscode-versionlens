import * as path from 'path';
import appSettings from './common/appSettings';

export function onActiveEditorChanged(editor, providers) {
  if (!editor || !editor.document) {
    appSettings.isActive = false;
    return;
  }

  const filename = path.basename(editor.document.fileName);
  for (var i = 0; i < providers.length; i++) {
    if (providers[i].selector.pattern.includes(filename)) {
      appSettings.isActive = true;
      return;
    }
  }

  appSettings.isActive = false;
}