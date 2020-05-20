import {
  PackageSourceTypes,
  PackageNameVersion,
  PackageSuggestion,
  PackageVersionTypes
} from "../definitions/packageDocument";
import { PackageIdentifier } from "../definitions/packageRequest";
import {
  PackageResponseErrors,
  PackageResponseStatus
} from "../definitions/packageResponse";
import { PackageDependencyRange } from "../definitions/iPackageDependencyLens";

export class PackageResponse {
  providerName: string;
  requested: PackageIdentifier;

  nameRange: PackageDependencyRange;
  versionRange: PackageDependencyRange;
  order: number;

  error?: PackageResponseErrors;
  errorMessage?: string;
  source?: PackageSourceTypes;
  response?: PackageResponseStatus;
  type?: PackageVersionTypes;
  resolved?: PackageNameVersion;
  suggestion?: PackageSuggestion;
}