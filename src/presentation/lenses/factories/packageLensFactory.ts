/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageLens, PackageErrors, } from "../definitions/packageLens";
import { PackageNameVersion, PackageDocument } from "core/packages/models/packageDocument";

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