// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import {
  PackageResponse,
  PackageResponseErrors,
  PackageSourceTypes,
  ReplaceVersionFunction,
} from 'core.packages';

import { IVersionCodeLens } from "./definitions/iVersionCodeLens";

// vscode implementations
const { CodeLens } = require('vscode');

export class VersionLens extends CodeLens implements IVersionCodeLens {

  replaceRange: VsCodeTypes.Range;

  package: PackageResponse;

  documentUrl: VsCodeTypes.Uri;

  replaceVersionFn: ReplaceVersionFunction;

  command: any;

  constructor(
    commandRange: VsCodeTypes.Range,
    replaceRange: VsCodeTypes.Range,
    packageResponse: PackageResponse,
    documentUrl: VsCodeTypes.Uri,
    replaceVersionFn: ReplaceVersionFunction
  ) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = packageResponse;
    this.documentUrl = documentUrl;
    this.command = null;
    this.replaceVersionFn = replaceVersionFn;
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