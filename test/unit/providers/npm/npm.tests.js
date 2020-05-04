/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// providers/npm/npmClient.js tests
import parseNpmArguments from './npmClientApi/parseNpmArguments.tests.js';
import npmViewDistTags from './npmClientApi/npmViewDistTags.tests.js';
import npmViewVersion from './npmClientApi/npmViewVersion.tests.js';

export const NPMClient = {
  parseNpmArguments,
  npmViewDistTags,
  npmViewVersion,
}

// providers/npm/npmPackageResolver.js tests
import resolveNpmPackage from './npmPackageResolver/resolveNpmPackage.tests.js';
import customGenerateVersion from './npmPackageResolver/customGenerateVersion.tests.js';

export const NPMPackageResolver = {
  resolveNpmPackage,
  customGenerateVersion,
}

// providers/npm/codeLensProvider.js tests
import evaluateCodeLens from './npmCodeLensProvider/evaluateCodeLens.tests.js'
import provideCodeLenses from './npmCodeLensProvider/provideCodeLenses.tests.js'

export const NPMCodeLensProvider = {
  evaluateCodeLens,
  provideCodeLenses,
}