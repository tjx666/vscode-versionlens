import { PackageSourceTypes, PackageVersionStatus } from "core/packages/models/packageDocument";
import { PackageLens, PackageErrors } from "../models/packageLens";

export interface IVersionCodeLens {
  replaceRange: any;
  package: PackageLens;
  documentUrl: string;
  command: any;
  replaceVersionFn: (string) => string;
  hasPackageSource: (source: PackageSourceTypes) => boolean;
  hasPackageError: (error: PackageErrors) => boolean;
  setCommand: (string, { }, []) => any;
}
