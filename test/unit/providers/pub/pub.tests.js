/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import resolvePubPackage from './pubPackageResolver/resolvePubPackage.tests.js';

export const PubPackageResolver = {
  resolvePubPackage,
}

import evaluateCodeLens from './pubCodeLensProvider/evaluateCodeLens.tests.js'
import provideCodeLenses from './pubCodeLensProvider/provideCodeLenses.tests.js'

export const PubCodeLensProvider = {
  evaluateCodeLens,
  provideCodeLenses,
}