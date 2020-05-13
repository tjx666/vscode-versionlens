import { PackageSourceTypes } from 'core/packages';

export function updateDependencyCommand(codeLens, packageVersion) {
  if (codeLens.__replaced) return Promise.resolve();
  const { workspace, WorkspaceEdit } = require('vscode');
  const edit = new WorkspaceEdit();
  edit.replace(codeLens.documentUrl, codeLens.replaceRange, packageVersion);
  return workspace.applyEdit(edit)
    .then(done => codeLens.__replaced = true);
}

export function linkCommand(codeLens) {
  const path = require('path');
  const opener = require('opener');
  if (codeLens.package.source === PackageSourceTypes.directory) {
    const filePathToOpen = path.resolve(
      path.dirname(codeLens.documentUrl.fsPath),
      codeLens.package.resolved.version
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