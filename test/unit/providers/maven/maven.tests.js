/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// mavenAPI tests
import mavenGetPackageVersions from './mavenAPI/mavenGetPackageVersions.tests.js'

export const MavenAPI = {
  mavenGetPackageVersions,
}

// mavenVersionUtils tests
import weightedQualifier from './mavenVersionUtils/weightedQualifier.tests.js'
import compareVersions from './mavenVersionUtils/compareVersions.tests.js'
import parseVersion from './mavenVersionUtils/parseVersion.tests.js'

export const MavenVersionUtils = {
  weightedQualifier,
  compareVersions,
  parseVersion
}