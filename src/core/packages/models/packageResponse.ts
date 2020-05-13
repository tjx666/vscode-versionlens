import {
  PackageSourceTypes,
  PackageNameVersion,
  PackageSuggestion,
  PackageVersionTypes
} from "core/packages/models/packageDocument";
import { PackageDependencyLens } from "core/packages/models/PackageDependencyLens";
import { HttpResponseSources } from "core/clients";
import { PackageIdentifier } from "./packageRequest";

export type ReplaceVersionFunction = (
  response: PackageResponse,
  version: string
) => string;

export type PackageResponseAggregate = {
  order: number,
  dependency: PackageDependencyLens,
  response: PackageResponse,
}

export enum PackageResponseErrors {
  None,
  NotFound,
  NotSupported,
  GitNotFound,
  InvalidVersion,
  Unexpected,
};

export type PackageResponseStatus = {
  source: HttpResponseSources,
  status: number,
}

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