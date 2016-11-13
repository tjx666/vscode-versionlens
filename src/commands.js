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
  edit.set(codeLens.uri, edits);
  return workspace.applyEdit(edit);
}

export function doMetaCommand(codeLens) {
  if (codeLens.commandMeta.type === 'file') {
    const filePathToOpen = path.resolve(path.dirname(codeLens.uri.fsPath), codeLens.commandMeta.uri);
    opener(filePathToOpen);
    return;
  }
  opener(codeLens.commandMeta.uri);
}

// export function updateDependenciesCommand(codeLens, packageVersion) {

// }