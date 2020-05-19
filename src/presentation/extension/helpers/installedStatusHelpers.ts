// vscode references
import * as VsCodeTypes from 'vscode';

const { window } = require('vscode');

let _decorations = [];
const _decorationTypeKey = window.createTextEditorDecorationType({
  margin: '0 .2em 0 0'
});

export function clearDecorations() {
  const { window } = require('vscode');
  if (!window || !window.activeTextEditor) return;

  _decorations = [];
  window.activeTextEditor.setDecorations(
    _decorationTypeKey,
    []
  );
}

export function setDecorations(decorationList) {
  const { window } = require('vscode');
  if (!window || !window.activeTextEditor)
    return;

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
    if (entry.range.start.line >= lineNum) {
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

export function createRenderOptions(contentText, color) {
  return {
    contentText,
    color
  };
}

export function renderMissingDecoration(range: VsCodeTypes.Range, missingStatusColour: string) {
  const { Range, Position } = require('vscode');
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ' ▪ missing install',
        missingStatusColour
      )
    }
  });
}

export function renderInstalledDecoration(
  range: VsCodeTypes.Range,
  version: string,
  installedStatusColour: string) {
  const { Range, Position } = require('vscode');
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} installed`,
        installedStatusColour
      )
    }
  });
}

export function renderNeedsUpdateDecoration(
  range: VsCodeTypes.Range,
  version: string,
  outdatedStatusColour: string
) {
  const { Range, Position } = require('vscode');
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} installed, npm update needed`,
        outdatedStatusColour
      )
    }
  });
}

export function renderOutdatedDecoration(
  range: VsCodeTypes.Range,
  version: string,
  outdatedStatusColour: string
) {
  const { Range, Position } = require('vscode');
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} installed`,
        outdatedStatusColour
      )
    }
  });
}

export function renderPrereleaseInstalledDecoration(
  range: VsCodeTypes.Range,
  version: string,
  prereleaseInstalledStatusColour: string
) {
  const { Range, Position } = require('vscode');
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} prerelease installed`,
        prereleaseInstalledStatusColour
      )
    }
  });
}

function updateDecoration(newDecoration) {
  const foundIndex = _decorations.findIndex(
    entry => entry.range.start.line === newDecoration.range.start.line
  );

  if (foundIndex > -1)
    _decorations[foundIndex] = newDecoration;
  else
    _decorations.push(newDecoration);

  setDecorations(_decorations);
}