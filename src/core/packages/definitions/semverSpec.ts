import { PackageVersionTypes } from "./packageDocument";

export type SemverSpec = {
  rawVersion: string,
  type: PackageVersionTypes,
};