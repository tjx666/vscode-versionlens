/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as PackageFactory from "./../../common/packageGeneration";

const semver = require("semver");

// pubPackageParser(dependencyNodes: any[], appContrib: AppContribution, pubPackageParser: any) {
//   throw new Error("Method not implemented.");
// }
export function pubPackageParser(name, version, appContrib) {
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
