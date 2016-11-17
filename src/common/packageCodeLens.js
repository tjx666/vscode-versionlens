/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CodeLens, Range, Uri } from 'vscode';
import { extractSymbolFromVersionRegex, formatWithExistingLeading } from './utils';

export class PackageCodeLens extends CodeLens {

  constructor(
    entryRange,
    versionRange,
    packageInfo,
    customGenerateVersion
  ) {
    super(entryRange);
    this.versionRange = versionRange || entryRange;
    this.package = packageInfo;
    this.customGenerateVersion = customGenerateVersion;
  }

  generateNewVersion(newVersion) {
    if(!this.customGenerateVersion) 
      return formatWithExistingLeading(this.package.version, newVersion);
    
    return this.customGenerateVersion.call(this, this.package, newVersion);
  }
}