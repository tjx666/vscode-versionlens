/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workspace } from 'vscode';
import { clearDecorations } from '../editor/decorations';

export const fileDependencyRegex = /^file:(.*)$/;
export const gitHubDependencyRegex = /^\/?([^:\/\s]+)(\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
export const stripSymbolFromVersionRegex = /^(?:[^0-9]+)?(.+)$/;
export const extractSymbolFromVersionRegex = /^([^0-9]*)?.*$/;
export const testRangedSymbolInVersionRegex = /([\^~xX]{1})/;
export const semverLeadingChars = ['^', '~', '<', '<=', '>', '>='];

export function hasRangeSymbols(version) {
  return testRangedSymbolInVersionRegex.test(version);
}

export function formatWithExistingLeading(existingVersion, newVersion) {
  const regExResult = extractSymbolFromVersionRegex.exec(existingVersion);
  const leading = regExResult && regExResult[1];
  if (!leading || !semverLeadingChars.includes(leading))
    return newVersion;

  return `${leading}${newVersion}`;
}

export function refreshCodeLens() {
  const key = 'editor.codeLens';
  const workspaceConfiguration = workspace.getConfiguration();
  const codeLensEnabled = workspaceConfiguration.inspect(key);
  if (codeLensEnabled === false)
    return;

  // clear any decorations
  clearDecorations();

  // turn off codelens
  workspaceConfiguration.update(key, false, true);

  // turn on code lens after 500 ms
  setTimeout(function () {
    // turn on codelens to refesh them
    workspaceConfiguration.update(key, true, true);
  }, 500);

}