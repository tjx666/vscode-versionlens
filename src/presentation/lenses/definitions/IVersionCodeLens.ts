import { PackageLens, PackageErrors } from "./packageLens";
import { PackageSourceTypes, PackageVersionStatus } from "core/packages/models/packageDocument";

export interface IVersionCodeLens {
  replaceRange: any;
  package: PackageLens;
  documentUrl: string;
  command: any;
  replaceVersionFn: (string) => string;

  // getTaggedVersionPrefix: (string) => string;
  // isInvalidVersion: () => boolean;
  // isTaggedVersion: () => boolean;
  // isTagName: (string) => boolean;
  // isFixedVersion: () => boolean;
  // isSource: (string) => boolean;
  // matchesLatestVersion: () => boolean;
  // satisfiesLatestVersion: () => boolean;
  // matchesPrereleaseVersion: () => boolean;
  // getTaggedVersion: () => boolean;
  // versionMatchNotFound: () => boolean;
  // getInstallIndicator: () => string;

  hasPackageSource: (source: PackageSourceTypes) => boolean;
  hasPackageStatus: (source: PackageVersionStatus) => boolean;
  hasPackageError: (error: PackageErrors) => boolean;
  setCommand: (string, { }, []) => any;
}
