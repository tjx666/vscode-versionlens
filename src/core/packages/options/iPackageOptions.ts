export type PackageFileFilter = {
  language?: string;
  scheme?: string;
  pattern?: string;
}

export interface IProviderOptions {
  readonly providerName: string;
  readonly group: Array<String>;
  readonly selector: PackageFileFilter;
}
