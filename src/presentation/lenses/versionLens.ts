// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import {
  VersionHelpers,
  PackageResponse,
  PackageResponseErrors,
  PackageSourceTypes,
} from 'core/packages';

import { IVersionCodeLens } from "./definitions/iVersionCodeLens";

// vscode implementations
const { CodeLens } = require('vscode');

export class VersionLens extends CodeLens implements IVersionCodeLens {

  replaceRange: VsCodeTypes.Range;

  package: PackageResponse;

  documentUrl: VsCodeTypes.Uri;

  command: any;

  constructor(
    commandRange: VsCodeTypes.Range,
    replaceRange: VsCodeTypes.Range,
    response: PackageResponse,
    documentUrl: VsCodeTypes.Uri
  ) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = response;
    this.documentUrl = documentUrl;
    this.command = null;
  }

  replaceVersionFn(newVersion: string) {
    if (!this.package.replaceVersionFn) {
      return VersionHelpers.formatWithExistingLeading(
        this.package.requested.version,
        newVersion
      );
    }

    return this.package.replaceVersionFn.call(
      this,
      this.package,
      newVersion
    );
  }

  hasPackageSource(source: PackageSourceTypes): boolean {
    return this.package.source === source;
  }

  hasPackageError(error: PackageResponseErrors): boolean {
    return this.package.error == error;
  }

  setCommand(title: string, command, args) {
    this.command = {
      title,
      command,
      arguments: args
    };
    return this;
  }

}