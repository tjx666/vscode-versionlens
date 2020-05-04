export interface PackageLensData {
  lensRange: {
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