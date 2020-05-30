import { ClientResponseSource } from 'core.clients';
import { PackageResponse } from "../models/packageResponse";

export type ReplaceVersionFunction = (
  response: PackageResponse,
  version: string
) => string;

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
