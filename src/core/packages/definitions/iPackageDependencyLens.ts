export interface IPackageDependencyLens {
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