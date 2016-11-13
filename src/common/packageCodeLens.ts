/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {CodeLens, Range, Uri} from 'vscode';

const VersionRegex = /^([^0-9]*)?.*$/;
const PreserveLeadingChars: Set<string> = new Set(['^', '~', '<', '<=', '>', '>=']);

export class PackageCodeLens extends CodeLens {
  uri: Uri;
  packageName: string;
  packageVersion: string;
  versionRange: Range;
  versionAdapter: (lens: PackageCodeLens, version: string, adaptedVersion: string) => string;

  constructor(
    idRange: Range,
    versionRange: Range,
    uri: Uri,
    packageName: string,
    packageVersion: string,
    versionAdapter?: (lens: PackageCodeLens, version: string, adaptedVersion: string) => string
  ) {
    super(idRange);
    this.uri = uri;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    this.versionRange = versionRange || idRange;
    this.versionAdapter = versionAdapter;
  }

  private _preserveLeading(newVersion: string) {
    const m = VersionRegex.exec(this.packageVersion);
    const leading = m && m[1];
    if (!leading || !PreserveLeadingChars.has(leading))
      return newVersion
    return `${leading}${newVersion}`;
  }

  toVersion(newVersion: string) {
    const adaptedVersion = this._preserveLeading(newVersion);
    return (this.versionAdapter && this.versionAdapter(this, newVersion, adaptedVersion)) || adaptedVersion;
  }
}