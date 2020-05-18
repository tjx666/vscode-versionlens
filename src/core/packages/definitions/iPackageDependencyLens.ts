export type PackageDependencyRange = {
  start: number;
  end: number;
}

export interface IPackageDependencyLens {

  nameRange: PackageDependencyRange;

  versionRange: PackageDependencyRange;

  packageInfo: {
    name: string;
    version: string;
  };

};