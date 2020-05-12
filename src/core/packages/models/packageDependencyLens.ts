
export type PackageFileParserDelegate = (packageFileText: string, filterPropertyNames: string[]) => PackageDependencyLens[];

export interface PackageDependencyLens {
  nameRange: {
    start: number;
    end: number;
  };
  versionRange: {
    start: number;
    end: number;
  };
  packageInfo: {
    name: string;
    version: string;
  };
};