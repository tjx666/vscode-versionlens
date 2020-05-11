/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { formatWithExistingLeading } from '../../../common/utils';
import appSettings from '../../../appSettings';
import { IVersionCodeLens } from "../definitions/IVersionCodeLens";
import { PackageLens, PackageErrors } from '../definitions/packageLens';
import { PackageDocument, PackageSourceTypes, PackageVersionTypes, PackageVersionStatus } from 'core/packages/models/packageDocument';

const { CodeLens } = require('vscode');

// import { PackageNameVersion } from '../../../core/common/models/packageDocument';

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

  // getTaggedVersionPrefix() {
  //   if (this.isTaggedVersion())
  //     return this.package.tag.name + ': ';

  //   return '';
  // }

  // isInvalidVersion() {
  //   return this.package.tag.name === PackageVersionStatus.invalid;
  // }

  // isTaggedVersion() {
  //   return this.package.meta.tag
  //     && !this.package.meta.tag.isPrimaryTag;
  // }

  // isTagName(name) {
  //   return this.package.meta.tag
  //     && this.package.meta.tag.name === name;
  // }

  // isFixedVersion() {
  //   return this.package.meta.tag.isFixedVersion;
  // }

  hasPackageSource(source: PackageSourceTypes): boolean {
    return this.package.source === source;
  }

  hasPackageStatus(source: PackageVersionStatus): boolean {
    return this.package.tag.name === source;
  }

  hasPackageError(error: PackageErrors): boolean {
    return this.package.error == error;
  }

  // matchesLatestVersion() {
  //   return this.package.meta.tag && this.package.meta.tag.isLatestVersion;
  // }

  // satisfiesLatestVersion() {
  //   return this.package.meta.tag.satisfiesLatest;
  // }

  // matchesPrereleaseVersion() {
  //   return this.package.meta.tag.isNewerThanLatest;
  // }

  // getTaggedVersion() {
  //   return this.package.meta.tag.version;
  // }


  // packageNotFound() {
  //   return this.package.meta.error == PackageErrors.NotFound;
  // }

  // packageNotSupported() {
  //   return this.package.meta.error == PackageErrors.NotSupported;
  // }

  packageUnexpectedError() {
    return this.package.error == PackageErrors.Unexpected;
  }

  // versionMatchNotFound() {
  //   return this.package.meta.tag.versionMatchNotFound;
  // }

  // getInstallIndicator() {
  //   return this.package.meta.tag && this.package.meta.tag.isOlderThanRequested ?
  //     appSettings.revertIndicator :
  //     appSettings.updateIndicator;
  // }

  setCommand(title, command, args) {
    this.command = {
      title,
      command,
      arguments: args
    };
    return this;
  }

}