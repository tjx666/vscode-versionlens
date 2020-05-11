/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from '../../appSettings';
import { getProvidersByFileName } from '../../providers/codeLensProviders';
import {
  getDecorationsByLine,
  removeDecorations,
  clearDecorations,
  removeDecorationsFromLine
} from './decorations';

export function onActiveEditorChanged(editor) {
  if (!editor) {
    appSettings.isActive = false;
    return;
  }

  clearDecorations();

  if (!editor.document) {
    appSettings.isActive = false;
    return;
  }

  if (getProvidersByFileName(editor.document.fileName)) {
    appSettings.isActive = true;
    return;
  }

  appSettings.isActive = false;
}

// update the decorators if the changed line affects them
export function onChangeTextDocument(changeEvent) {
  // ensure version lens is active
  if (appSettings.isActive === false)
    return;

  const foundDecorations = [];
  const { contentChanges } = changeEvent;

  // get all decorations for all the lines that have changed
  contentChanges.forEach(change => {
    const startLine = change.range.start.line;
    let endLine = change.range.end.line;

    if (change.text.charAt(0) == '\n' || endLine > startLine) {
      removeDecorationsFromLine(startLine)
      return;
    }

    for (let line = startLine; line <= endLine; line++) {
      const lineDecorations = getDecorationsByLine(line);
      if (lineDecorations.length > 0)
        foundDecorations.push(...lineDecorations);
    }
  })

  if (foundDecorations.length === 0)
    return;

  // remove all decorations that have changed
  removeDecorations(foundDecorations);
}