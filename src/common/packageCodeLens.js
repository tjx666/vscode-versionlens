/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CodeLens, Range, Uri } from 'vscode';

const versionRegex = /^([^0-9]*)?.*$/;
const preserveLeadingChars = ['^', '~', '<', '<=', '>', '>='];

export class PackageCodeLens extends CodeLens {

  constructor(
    entryRange,
    versionRange,
    uri,
    packageName,
    packageVersion,
    commandMeta,
    isValidSemver,
    versionAdapter
  ) {
    super(entryRange);
    this.uri = uri;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    this.versionRange = versionRange || entryRange;
    this.commandMeta = commandMeta;
    this.isValidSemver = isValidSemver;
    this.versionAdapter = versionAdapter;
  }

  preserveLeading_(newVersion) {
    const regExResult = versionRegex.exec(this.packageVersion);
    const leading = regExResult && regExResult[1];
    if (!leading || !preserveLeadingChars.includes(leading))
      return newVersion
    return `${leading}${newVersion}`;
  }

  toVersion(newVersion) {
    const adaptedVersion = this.preserveLeading_(newVersion);
    return (this.versionAdapter && this.versionAdapter(this, newVersion, adaptedVersion)) || adaptedVersion;
  }
}