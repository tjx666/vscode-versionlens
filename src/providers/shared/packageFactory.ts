/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {Package, PackageMeta, PackageErrors} from './definitions';

export function createPackageNotSupported(name: string, version: string, type: string): Package {
  const meta = {
    type,
    error: PackageErrors.NotSupported,
    message: "Package registry not supported",
    tag: {
      isPrimaryTag: true
    }
  };

  return createPackage(name, version, meta, null);
}

export function createPackageNotFound(name: string, version: string, type: string): Package {
  const meta = {
    type,
    error: PackageErrors.NotFound,
    message: `${name} could not be found`,
    tag: {
      isPrimaryTag: true
    }
  };

  return createPackage(name, version, meta, null);
}

export function createInvalidVersion(name: string, version: string, type: string): Package {
  const meta = {
    type,
    error: PackageErrors.InvalidVersion,
    message: null,
    tag: {
      isInvalid: true,
      isPrimaryTag: true
    }
  };
  return createPackage(name, version, meta, null);
}

export function createGitFailed(name: string, message: string, type: string): Package {
  const meta = {
    type,
    error: PackageErrors.GitNotFound,
    message: `Could not find git repo: ${message}`,
    tag: {
      isPrimaryTag: true
    }
  };

  return createPackage(name, message, meta, null);
}

export function createUnexpectedError(name: string, message: string): Package {
  const meta = {
    type: null,
    error: PackageErrors.Unexpected,
    message,
    tag: null
  };

  return createPackage(
    name,
    message,
    meta,
    null
  );
}

export function createPackage(name: string, version: string, meta: PackageMeta, customGenerateVersion: Function): Package {
  return {
    name,
    version,
    meta,
    customGenerateVersion
  };
}