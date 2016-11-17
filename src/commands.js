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
  edit.set(codeLens.package.meta.localUrl, edits);
  return workspace.applyEdit(edit);
}

export function linkCommand(codeLens) {
  if (codeLens.package.meta.type === 'file') {
    const filePathToOpen = path.resolve(path.dirname(codeLens.package.meta.localUrl.fsPath), codeLens.package.meta.remoteUrl);
    opener(filePathToOpen);
    return;
  }
  opener(codeLens.package.meta.remoteUrl);
}

// export function updateDependenciesCommand(codeLens, packageVersion) {

// }