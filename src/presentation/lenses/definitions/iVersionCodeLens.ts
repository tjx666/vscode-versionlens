import * as VsCodeTypes from "vscode";

import {
  PackageSourceTypes,
  PackageResponseErrors,
  PackageResponse,
  ReplaceVersionFunction
} from "core/packages";

export interface IVersionCodeLens {
  replaceRange: VsCodeTypes.Range;
  package: PackageResponse;
  documentUrl: VsCodeTypes.Uri;
  command: any;

  replaceVersionFn: ReplaceVersionFunction;
  hasPackageSource: (source: PackageSourceTypes) => boolean;
  hasPackageError: (error: PackageResponseErrors) => boolean;
  setCommand: (string, { }, []) => any;
}
