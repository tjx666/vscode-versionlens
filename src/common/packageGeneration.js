/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function createPackageNotSupported(name, version, type) {
  return {
    name,
    version,
    meta: {
      type,
      packageNotSupported: true,
      message: "Package registry not supported"
    }
  };
}

export function createPackageNotFound(name, version, type) {
  return {
    name,
    version,
    meta: {
      type,
      packageNotFound: true,
      message: `${name} could not be found`
    }
  };
}

export function createPackage(name, version, info, customGenerateVersion) {
  return {
    name,
    version,
    meta: info,
    customGenerateVersion
  };
}