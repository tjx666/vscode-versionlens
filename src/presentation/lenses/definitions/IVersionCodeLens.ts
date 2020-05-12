import { PackageSourceTypes, PackageVersionStatus } from "core/packages/models/packageDocument";
import { PackageResponse, PackageResponseErrors } from "../../../core/packages/models/packageResponse";
import { Uri } from "vscode";

export interface IVersionCodeLens {
  replaceRange: any;
  package: PackageResponse;
  documentUrl: Uri;
  command: any;
  replaceVersionFn: (string) => string;
  hasPackageSource: (source: PackageSourceTypes) => boolean;
  hasPackageError: (error: PackageResponseErrors) => boolean;
  setCommand: (string, { }, []) => any;
}
