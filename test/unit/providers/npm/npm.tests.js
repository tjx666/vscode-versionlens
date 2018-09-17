/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// npm client
import parseNpmArguments from './client/parseNpmArguments.tests.js';
import npmViewDistTags from './client/npmViewDistTags.tests.js';
import npmViewVersion from './client/npmViewVersion.tests.js';

export const NPMClient = {
  parseNpmArguments,
  npmViewDistTags,
  npmViewVersion,
}

// npm package parser
import npmPackageParser from './packageParser/npmPackageParser.tests.js';
import customGenerateVersion from './packageParser/customGenerateVersion.tests.js';

export const NPMPackageParser = {
  npmPackageParser,
  customGenerateVersion,
}

// npm codelens provider
import evaluateCodeLens from './codeLensProvider/evaluateCodeLens.tests.js'
import provideCodeLenses from './codeLensProvider/provideCodeLenses.tests.js'

export const NPMCodeLensProvider = {
  evaluateCodeLens,
  provideCodeLenses,
}