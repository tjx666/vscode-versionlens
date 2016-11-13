/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CodeLens, Range, Uri } from 'vscode';

const VersionRegex = /^([^0-9]*)?.*$/;
const PreserveLeadingChars = new Set(['^', '~', '<', '<=', '>', '>=']);

export class PackageCodeLens extends CodeLens {

  constructor(
    entryRange,
    versionRange,
    uri,
    packageName,
    packageVersion,
    commandMeta,
    versionAdapter
  ) {
    super(entryRange);
    this.uri = uri;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    this.versionRange = versionRange || entryRange;
    this.commandMeta = commandMeta;
    this.versionAdapter = versionAdapter;
  }

  preserveLeading_(newVersion) {
    const m = VersionRegex.exec(this.packageVersion);
    const leading = m && m[1];
    if (!leading || !PreserveLeadingChars.has(leading))
      return newVersion
    return `${leading}${newVersion}`;
  }

  toVersion(newVersion) {
    const adaptedVersion = this.preserveLeading_(newVersion);
    return (this.versionAdapter && this.versionAdapter(this, newVersion, adaptedVersion)) || adaptedVersion;
  }
}