import { PackageResponse } from "../models/packageResponse";

export type TReplaceVersionFunction = (

  response: PackageResponse,

  version: string

) => string;