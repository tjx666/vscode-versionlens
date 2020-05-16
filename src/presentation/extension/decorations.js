import appConfig from 'presentation/configuration';

const { window, Range, Position } = require('vscode');

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

export function renderMissingDecoration(range) {
  updateDecoration({
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
  });
}

export function renderInstalledDecoration(range, version) {
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} installed`,
        appConfig.installedDependencyColour
      )
    }
  });
}

export function renderNeedsUpdateDecoration(range, version) {
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} installed, npm update needed`,
        appConfig.outdatedDependencyColour
      )
    }
  });
}

export function renderOutdatedDecoration(range, version) {
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} installed`,
        appConfig.outdatedDependencyColour
      )
    }
  });
}

export function renderPrereleaseInstalledDecoration(range, version) {
  updateDecoration({
    range: new Range(
      range.start,
      new Position(range.end.line, range.end.character + 1)
    ),
    hoverMessage: null,
    renderOptions: {
      after: createRenderOptions(
        ` ▪ ${version} prerelease installed`,
        appConfig.prereleaseDependencyColour
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