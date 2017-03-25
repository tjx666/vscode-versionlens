/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
    return newVersion

  return `${leading}${newVersion}`;
}
