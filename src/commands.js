/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workspace, TextEdit, WorkspaceEdit } from 'vscode';
import * as path from 'path';
import * as opener from 'opener';

export function updateDependencyCommand(codeLens, packageVersion) {
  const edits = [TextEdit.replace(codeLens.versionRange, packageVersion)];
  const edit = new WorkspaceEdit();
  edit.set(codeLens.meta.localURI, edits);
  return workspace.applyEdit(edit);
}

export function linkCommand(codeLens) {
  if (codeLens.meta.type === 'file') {
    const filePathToOpen = path.resolve(path.dirname(codeLens.meta.localURI.fsPath), codeLens.meta.remoteURI);
    opener(filePathToOpen);
    return;
  }
  opener(codeLens.meta.remoteURI);
}

// export function updateDependenciesCommand(codeLens, packageVersion) {

// }