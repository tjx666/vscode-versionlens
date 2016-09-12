/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {CodeLens, Range, Uri} from 'vscode';

export class PackageCodeLens extends CodeLens {
  uri: Uri;
  packageName: string;
  packageVersion: string;
  versionRange: Range;
  versionAdapter: (lens: PackageCodeLens, version: string) => string;

  constructor(
    idRange: Range,
    versionRange: Range,
    uri: Uri,
    packageName: string,
    packageVersion: string,
    versionAdapter?: (lens: PackageCodeLens, version: string) => string
  ) {
    super(idRange);
    this.uri = uri;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    this.versionRange = versionRange || idRange;
    this.versionAdapter = versionAdapter;
  }

  toVersion(newVersion: string) {
    return (this.versionAdapter && this.versionAdapter(this, newVersion)) || newVersion;
  }
}