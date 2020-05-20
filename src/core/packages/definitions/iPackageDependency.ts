export type PackageDependencyRange = {
  start: number;
  end: number;
}

export interface IPackageDependency {

  nameRange: PackageDependencyRange;

  versionRange: PackageDependencyRange;

  packageInfo: {
    name: string;
    version: string;
  };

};