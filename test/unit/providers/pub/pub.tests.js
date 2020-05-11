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