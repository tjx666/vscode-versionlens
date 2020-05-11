// dotnet utils
import parseVersionSpec from './dotnetUtils/parseVersionSpec.tests.js';
export const DotNetUtils = {
  parseVersionSpec,
}

// nuget client
import nugetGetPackageVersions from './nugetClient/nugetGetPackageVersions.tests.js';
export const DotNetNugetClient = {
  nugetGetPackageVersions,
}

// dotnet codelens provider
import evaluateCodeLens from './dotnetCodeLensProvider/evaluateCodeLens.tests.js';
export const DotNetCodeLensProvider = {
  evaluateCodeLens,
}