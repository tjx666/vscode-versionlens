/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// dotnet utils
import parseVersionSpec from './utils/parseVersionSpec.tests.js';
import convertNugetToNodeRange from './utils/convertNugetToNodeRange.tests.js';
export const DotNetUtils = {
  parseVersionSpec,
  convertNugetToNodeRange,
}

// nuget client
import nugetGetPackageVersions from './nugetClient/nugetGetPackageVersions.tests.js';
export const DotNetNugetClient = {
  nugetGetPackageVersions,
}

// dotnet codelens provider
import evaluateCodeLens from './codeLensProvider/evaluateCodeLens.tests.js';
export const DotNetCodeLensProvider = {
  evaluateCodeLens,
}