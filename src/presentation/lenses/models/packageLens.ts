import { PackageSourceTypes, PackageNameVersion, PackageVersionTypes } from "core/packages/models/packageDocument";

export type ReplaceVersionFunction = (packageLens: PackageLens, version: string) => string;

export enum PackageErrors {
  None,
  NotFound,
  NotSupported,
  GitNotFound,
  InvalidVersion,
  Unexpected,
};

export class PackageLens {
  provider: string;
  requested: PackageNameVersion;
  error?: PackageErrors;
  errorMessage?: string;

  source?: PackageSourceTypes;
  type?: PackageVersionTypes;
  resolved?: PackageNameVersion;
  tag?: PackageNameVersion;
  replaceVersionFn?: ReplaceVersionFunction;
}