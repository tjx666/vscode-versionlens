/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { window, Range, Position } from 'vscode';
import appSettings from '../common/appSettings';
import { appConfig } from '../common/appConfiguration';

let _decorations = [];
const _decorationTypeKey = window.createTextEditorDecorationType({
  margin: '0 .2em 0 0'
});

export function clearDecorations() {
  _decorations = [];
  window.activeTextEditor.setDecorations(
    _decorationTypeKey,
    []
  );
}

export function setDecorations(decorationList) {
  window.activeTextEditor.setDecorations(
    _decorationTypeKey,
    decorationList
  );
}

export function removeDecorations(removeDecorationList) {
  if (removeDecorationList.length === 0 || _decorations.length === 0)
    return;

  const newDecorations = []
  for (let i = 0; i < _decorations.length; i++) {
    const foundIndex = removeDecorationList.indexOf(_decorations[i]);
    if (foundIndex === -1)
      newDecorations.push(_decorations[i]);
  }

  _decorations = newDecorations;
  window.activeTextEditor.setDecorations(
    _decorationTypeKey,
    _decorations
  );
}

export function removeDecorationsFromLine(lineNum) {
  const results = [];
  for (let i = 0; i < _decorations.length; i++) {
    const entry = _decorations[i];
    if (entry.range.start.line > lineNum) {
      results.push(entry);
    }
  }
  removeDecorations(results);
}

export function getDecorationsByLine(lineToFilterBy) {
  const results = [];
  for (let i = 0; i < _decorations.length; i++) {
    const entry = _decorations[i];
    if (entry.range.start.line === lineToFilterBy) {
      results.push(entry);
    }
  }

  return results;
}

export function updateDecoration(newDecoration) {
  const foundIndex = _decorations.findIndex(
    entry => entry.range.start.line === newDecoration.range.start.line
  );

  if (foundIndex > -1) {
    _decorations[foundIndex] = newDecoration;
  } else {
    _decorations.push(newDecoration);
  }

  setDecorations(_decorations);
}

export function createRenderOptions(contentText, color) {
  return {
    contentText,
    color
  };
}

export function createMissingDecoration(range) {
  return {
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ' ▪ missing install',
        appConfig.missingDependencyColour
      )
    }
  };
}

export function createInstalledDecoration(range) {
  return {
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ' ▪ latest installed',
        appConfig.installedDependencyColour
      )
    }
  };
}

export function createOutdatedDecoration(range, installedVersion) {
  return {
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${installedVersion} installed`,
        appConfig.outdatedDependencyColour
      )
    }
  };
}
