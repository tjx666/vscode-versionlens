/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as PackageFactory from "../../common/packageGeneration";

const semver = require("semver");

export function resolvePubPackage(name, version, appContrib) {
  // check if its a valid semver, if not could be a tag
  const isValidSemver = semver.validRange(version);

  const meta = {
    type: "pub",
    tag: {
      name: "latest",
      version: "latest",
      isInvalid: !isValidSemver
    }
  };

  return PackageFactory.createPackage(name, version, meta);
}
