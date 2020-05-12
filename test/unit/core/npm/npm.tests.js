// pacoteClientApi tests
import * as PacoteApiClient from './pacoteApiClient/pacoteApiClient.tests.js';
export const PacoteApiClientTests = {
  PacoteApiClient
}

// npmPackageResolver tests
import resolveNpmPackage from './npmPackageResolver/resolveNpmPackage.tests.js';
import customGenerateVersion from './npmPackageResolver/customGenerateVersion.tests.js';
export const NPMPackageResolver = {
  resolveNpmPackage,
  customGenerateVersion,
}

// codeLensProvider tests
import evaluateCodeLens from './npmCodeLensProvider/evaluateCodeLens.tests.js'
import provideCodeLenses from './npmCodeLensProvider/provideCodeLenses.tests.js'

export const NPMCodeLensProvider = {
  evaluateCodeLens,
  provideCodeLenses,
}