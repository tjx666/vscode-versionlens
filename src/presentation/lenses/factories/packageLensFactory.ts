import { PackageNameVersion, PackageDocument } from "core/packages/models/packageDocument";
import { PackageDependencyLens } from "core/packages/models/PackageDependencyLens";
import { PackageLens, PackageErrors, PackageLensResolverFunction, } from "../models/packageLens";

export function createPackageLensResolvers(
  packagePath: string,
  packageDepsLenses: Array<PackageDependencyLens>,
  customPackageResolver: PackageLensResolverFunction = null) {

  const collector = [];

  packageDepsLenses.forEach(
    function (lens) {
      let packageEntries = null;

      if (customPackageResolver) {
        const { name, version } = lens.packageInfo;
        packageEntries = customPackageResolver(packagePath, name, version, null);

        // if the package wasn't resolved then skip
        if (!packageEntries) throw new Error("hmmmmmm");

        // // ensure the result is a promise
        packageEntries = Promise.resolve(packageEntries)
          .then(function (reportItem) {
            if (Array.isArray(reportItem) === false)
              return [{ node: lens, package: reportItem }];

            return reportItem.map(
              pkg => {
                return { node: lens, package: pkg }
              }
            );
          });
      }

      if (!packageEntries) packageEntries = Promise.resolve({ node: lens });

      collector.push(packageEntries);
    }
  );

  return collector;
}



export function createPackageLens(pack: PackageDocument, replaceVersionFn = null): Array<PackageLens> {
  // map the tags to packages
  return pack.tags.map((tag, index): PackageLens => {
    const packageLens: PackageLens = {
      provider: pack.provider,
      source: pack.source,
      type: pack.type,
      requested: pack.requested,
      resolved: pack.resolved,
      tag,
      replaceVersionFn
    };

    return packageLens;
  })
}

export function createPackageNotSupported(provider: string, requested: PackageNameVersion): PackageLens {
  const error: PackageLens = {
    provider,
    requested,
    error: PackageErrors.NotSupported,
    errorMessage: "Package registry not supported",
  };
  return error;
}

export function createPackageNotFound(provider: string, requested: PackageNameVersion): PackageLens {
  const error: PackageLens = {
    provider,
    requested,
    error: PackageErrors.NotFound,
    errorMessage: "Package not found",
  };
  return error;
}

// export function createInvalidVersion(name: string, version: string, type: string): PackageLens {
//   const meta = {
//     type,
//     error: PackageErrors.InvalidVersion,
//     message: null,
//     tag: {
//       isInvalid: true,
//       isPrimaryTag: true
//     }
//   };
//   return createPackage(name, version, meta, null);
// }

// export function createGitFailed(name: string, message: string, type: string): PackageLens {
//   const meta = {
//     type,
//     error: PackageErrors.GitNotFound,
//     message: `Could not find git repo: ${message}`,
//     tag: {
//       isPrimaryTag: true
//     }
//   };



//   return createPackage(name, message, meta, null);
// }

export function createUnexpectedError(provider: string, requested: PackageNameVersion, errorMessage: string): PackageLens {
  const error: PackageLens = {
    provider,
    requested,
    error: PackageErrors.Unexpected,
    errorMessage,
  };
  return error;
}

// export function createPackage(source: string, resolved: PackageNameVersion, requested: PackageNameVersion, replaceVersionFn?: ReplaceVersionFunction): PackageLens {
//   return {
//     name,
//     version,
//     meta,
//     replaceVersionFn
//   };
// }