/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function updateDependencyCommand(codeLens, packageVersion) {
  const { workspace, TextEdit, WorkspaceEdit } = require('vscode');
  const edits = TextEdit.replace(codeLens.replaceRange, packageVersion);
  const edit = new WorkspaceEdit();
  edit.set(codeLens.documentUrl, [edits]);
  workspace.applyEdit(edit);
}

export function linkCommand(codeLens) {
  const path = require('path');
  const opener = require('opener');
  if (codeLens.package.meta.type === 'file') {
    const filePathToOpen = path.resolve(
      path.dirname(codeLens.documentUrl.fsPath),
      codeLens.package.meta.remoteUrl
    );
    opener(filePathToOpen);
    return;
  }
  opener(codeLens.package.meta.remoteUrl);
}

export function showingProgress(file) {
  // currently do nothing

  // TODO attempt cancel?
}