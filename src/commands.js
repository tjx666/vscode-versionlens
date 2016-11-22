/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workspace, TextEdit, WorkspaceEdit } from 'vscode';
import * as path from 'path';
import * as opener from 'opener';

export function updateDependencyCommand(codeLens, packageVersion) {
  const edits = [TextEdit.replace(codeLens.replaceRange, packageVersion)];
  const edit = new WorkspaceEdit();
  edit.set(codeLens.documentUrl, edits);
  workspace.applyEdit(edit);
  codeLens.pendingEval = true;
}

export function linkCommand(codeLens) {
  if (codeLens.package.meta.type === 'file') {
    const filePathToOpen = path.resolve(path.dirname(codeLens.documentUrl.fsPath), codeLens.package.meta.remoteUrl);
    opener(filePathToOpen);
    return;
  }
  opener(codeLens.package.meta.remoteUrl);
}

export function updateDependenciesCommand(rootCodeLens, codeLenCollection) {
  const edits = codeLenCollection
    .filter(codeLens => codeLens != rootCodeLens)
    .filter(codeLens => rootCodeLens.range.contains(codeLens.range))
    .filter(codeLens => codeLens.command && codeLens.command.arguments)
    .filter(codeLens => codeLens.package)
    .filter(codeLens => !codeLens.package.meta || (codeLens.package.meta.type !== 'github' && codeLens.package.meta.type !== 'file'))
    .map(codeLens => TextEdit.replace(codeLens.replaceRange, codeLens.command.arguments[1]));

  const edit = new WorkspaceEdit();
  edit.set(rootCodeLens.documentUrl, edits);
  workspace.applyEdit(edit);
}