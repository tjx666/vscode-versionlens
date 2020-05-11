import { PackageLens, PackageErrors } from "../models/packageLens";
import { PackageSourceTypes, PackageVersionStatus } from "core/packages/models/packageDocument";

export interface IVersionCodeLens {
  replaceRange: any;
  package: PackageLens;
  documentUrl: string;
  command: any;
  replaceVersionFn: (string) => string;
  hasPackageSource: (source: PackageSourceTypes) => boolean;
  hasPackageStatus: (source: PackageVersionStatus) => boolean;
  hasPackageError: (error: PackageErrors) => boolean;
  setCommand: (string, { }, []) => any;
}
