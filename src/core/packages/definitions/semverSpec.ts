import { PackageVersionTypes } from "../models/packageDocument";

export type SemverSpec = {
  rawVersion: string,
  type: PackageVersionTypes,
};