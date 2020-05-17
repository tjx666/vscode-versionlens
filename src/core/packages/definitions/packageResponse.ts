import { ClientResponseSource } from "core/clients";
import { IPackageDependencyLens } from "../definitions/iPackageDependencyLens";
import { PackageResponse } from "../models/packageResponse";

export type ReplaceVersionFunction = (
  response: PackageResponse,
  version: string
) => string;

export type PackageResponseAggregate = {
  order: number,
  dependency: IPackageDependencyLens,
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
