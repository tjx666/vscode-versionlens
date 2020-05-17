import { ReplaceVersionFunction } from '../definitions/packageResponse'

export type PackageClientContext<TClientData> = {
  includePrereleases: boolean;
  clientData: TClientData,
  replaceVersion?: ReplaceVersionFunction,
}