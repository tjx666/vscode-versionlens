/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as PackageLensFactory from "presentation/lenses/factories/packageLensFactory";
import { PackageErrors } from "presentation/lenses/models/packageLens";

const semver = require("semver");

export function resolvePubPackage(name, version, appContrib) {
  // check if its a valid semver, if not could be a tag
  const isValidSemver = semver.validRange(version);

  const meta = {
    type: "pub",
    error: PackageErrors.Unexpected,
    message: null,
    tag: {
      name: "latest",
      version: "latest",
      isInvalid: !isValidSemver
    }
  };

  // return PackageLensFactory.createPackage(name, version, meta, null);
}
