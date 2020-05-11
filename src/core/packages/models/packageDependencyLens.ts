
export type PackageFileParserDelegate = (packageFileText: string, filterPropertyNames: string[]) => PackageDependencyLens[];

export interface PackageDependencyLens {
  lensRange: { // todo rename to 'nameRange'
    start: Number;
    end: Number;
  };
  versionRange: {
    start: Number;
    end: Number;
  };
  packageInfo: {
    name: string;
    version: string;
  };
};