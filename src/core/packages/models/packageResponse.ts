import {
  PackageSourceTypes,
  PackageNameVersion,
  PackageSuggestion,
  PackageVersionTypes
} from "../definitions/packageDocument";
import { PackageIdentifier } from "../definitions/packageRequest";
import {
  PackageResponseErrors,
  PackageResponseStatus,
  ReplaceVersionFunction
} from "../definitions/packageResponse";

export class PackageResponse {
  provider: string;
  requested: PackageIdentifier;
  error?: PackageResponseErrors;
  errorMessage?: string;

  source?: PackageSourceTypes;
  response?: PackageResponseStatus;
  type?: PackageVersionTypes;
  resolved?: PackageNameVersion;
  suggestion?: PackageSuggestion;
  replaceVersionFn?: ReplaceVersionFunction;
}