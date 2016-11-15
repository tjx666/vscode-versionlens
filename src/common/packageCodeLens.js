/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CodeLens, Range, Uri } from 'vscode';
import { extractSymbolFromVersionRegex } from './utils';

const preserveLeadingChars = ['^', '~', '<', '<=', '>', '>='];

export class PackageCodeLens extends CodeLens {

  constructor(
    entryRange,
    versionRange,
    packageName,
    packageVersion,
    meta,
    isValidSemver,
    customGenerateVersion
  ) {
    super(entryRange);
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    this.versionRange = versionRange || entryRange;
    this.meta = meta;
    this.isValidSemver = isValidSemver;
    this.customGenerateVersion = customGenerateVersion;
  }

  preserveLeading_(newVersion) {
    const regExResult = extractSymbolFromVersionRegex.exec(this.packageVersion);
    const leading = regExResult && regExResult[1];
    if (!leading || !preserveLeadingChars.includes(leading))
      return newVersion
    return `${leading}${newVersion}`;
  }

  generateNewVersion(newVersion) {
    const adaptedVersion = this.preserveLeading_(newVersion);
    return (this.customGenerateVersion && this.customGenerateVersion(this, adaptedVersion)) || adaptedVersion;
  }
}