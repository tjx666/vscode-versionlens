/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { formatWithExistingLeading } from '../../../common/utils';
import { IVersionCodeLens } from "../definitions/IVersionCodeLens";
import { PackageLens, PackageErrors } from '../definitions/packageLens';
import { PackageSourceTypes, PackageVersionStatus } from 'core/packages/models/packageDocument';

const { CodeLens } = require('vscode');

export class VersionLens extends CodeLens implements IVersionCodeLens {

  replaceRange: any;

  package: PackageLens;

  documentUrl: string;

  command: any;

  constructor(commandRange, replaceRange, packageLens: PackageLens, documentUrl: string) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = packageLens;
    this.documentUrl = documentUrl;
    this.command = null;
  }

  replaceVersionFn(newVersion) {
    if (!this.package.replaceVersionFn)
      return formatWithExistingLeading(this.package.requested.version, newVersion);

    return this.package.replaceVersionFn.call(this, this.package, newVersion);
  }

  hasPackageSource(source: PackageSourceTypes): boolean {
    return this.package.source === source;
  }

  hasPackageStatus(source: PackageVersionStatus): boolean {
    return this.package.tag.name === source;
  }

  hasPackageError(error: PackageErrors): boolean {
    return this.package.error == error;
  }

  setCommand(title, command, args) {
    this.command = {
      title,
      command,
      arguments: args
    };
    return this;
  }

}