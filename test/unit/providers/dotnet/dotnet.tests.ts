import parseVersionSpec from './dotnetUtils/parseVersionSpec.tests';
export const DotNetUtils = {
  parseVersionSpec,
}

export * from './clients/dotnetClient.tests';

export * from './clients/nugetResourceClient.tests';
export * from './clients/nugetResourceClient.tests';


// Package Parser Tests
import createDependenciesFromXml from './dotnetXmlParserFactory/createDependenciesFromXml.tests';

export const DotnetParserTests = {
  createDependenciesFromXml,
}