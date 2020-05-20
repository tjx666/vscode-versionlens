export type PackageClientContext<TClientData> = {
  includePrereleases: boolean;
  clientData: TClientData,
}