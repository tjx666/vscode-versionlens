import {
  PackageSourceTypes,
  PackageNameVersion,
  PackageVersionTypes,
  PackageSuggestion
} from "core/packages/models/packageDocument";
import { PackageDependencyLens } from "./PackageDependencyLens";
import { FetchRequest } from "core/clients/models/fetch";

export type PackageResponseAggregate = {
  order: number,
  dependency: PackageDependencyLens,
  response: PackageResponse,
}

export type PackageResolverFunction = (
  request: FetchRequest,
  replaceVersionFn: ReplaceVersionFunction
) => Promise<Array<PackageResponse> | PackageResponse>;

export type ReplaceVersionFunction = (response: PackageResponse, version: string) => string;

export enum PackageResponseErrors {
  None,
  NotFound,
  NotSupported,
  GitNotFound,
  InvalidVersion,
  Unexpected,
};

export class PackageResponse {
  provider: string;
  requested: PackageNameVersion;
  error?: PackageResponseErrors;
  errorMessage?: string;

  source?: PackageSourceTypes;
  type?: PackageVersionTypes;
  resolved?: PackageNameVersion;
  suggestion?: PackageSuggestion;
  replaceVersionFn?: ReplaceVersionFunction;
}