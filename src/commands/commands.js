/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workspace, TextEdit, WorkspaceEdit } from 'vscode';
import * as path from 'path';
import * as opener from 'opener';
import appSettings from '../common/appSettings';
import * as utils from '../common/utils';

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

export function showTaggedVersions(file) {
  appSettings.showTaggedVersions = true;
  utils.refreshCodeLens();
}

export function hideTaggedVersions(file) {
  appSettings.showTaggedVersions = false;
  utils.refreshCodeLens();
}

export function showVersionLenses(file) {
  appSettings.showVersionLenses = true;
  utils.refreshCodeLens();
}

export function hideVersionLenses(file) {
  appSettings.showVersionLenses = false;
  utils.refreshCodeLens();
}