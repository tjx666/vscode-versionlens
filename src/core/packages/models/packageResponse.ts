import { ClientResponseSource } from "core/clients";
import {
  PackageSourceTypes,
  PackageNameVersion,
  PackageSuggestion,
  PackageVersionTypes
} from "./packageDocument";
import { PackageDependencyLens } from "./packageDependencyLens";
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
  source: ClientResponseSource,
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