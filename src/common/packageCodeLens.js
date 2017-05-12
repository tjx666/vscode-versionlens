/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CodeLens, Range, Uri } from 'vscode';
import { extractSymbolFromVersionRegex, formatWithExistingLeading } from './utils';

export class PackageCodeLens extends CodeLens {

  constructor(commandRange, replaceRange, packageInfo, documentUrl) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = packageInfo;
    this.documentUrl = documentUrl;
    this.command = null;
  }

  generateNewVersion(newVersion) {
    if (!this.package.customGenerateVersion)
      return formatWithExistingLeading(this.package.version, newVersion);

    return this.package.customGenerateVersion.call(this, this.package, newVersion);
  }

  getTaggedVersionPrefix() {
    if (this.package && this.package.meta && this.package.meta.isTaggedVersion)
      return this.package.meta.tag.name + ': ';

    return '';
  }

  isTaggedVersion() {
    return this.package && this.package.meta && this.package.meta.isTaggedVersion;
  }

  isFixedVersion() {
    return this.package && this.package.meta && this.package.meta.isFixedVersion;
  }

  getTaggedVersion() {
    return this.package.meta.tag.version;
  }

  notFound() {
    return this.package && this.package.meta && this.package.meta.notFound;
  }

  setCommand(text, command, args) {
    this.command = {
      title: text,
      command: command || null,
      arguments: args || null
    };
    return this;
  }

}