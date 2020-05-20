
// VersionHelperTests
import extractTaggedVersions from './helpers/versionHelpers/extractTaggedVersions.tests';
import rollupPrereleases from './helpers/versionHelpers/filterPrereleasesWithinRange.tests';
import splitReleasesFromArray from './helpers/versionHelpers/splitReleasesFromArray.tests';
import removeFourSegmentVersionsFromArray from './helpers/versionHelpers/removeFourSegmentVersionsFromArray.tests';
import friendlifyPrereleaseName from './helpers/versionHelpers/friendlifyPrereleaseName.tests';
import filterSemverVersions from './helpers/versionHelpers/filterSemverVersions.tests';
import isFixedVersion from './helpers/versionHelpers/isFixedVersion.tests';

export const VersionHelperTests = {
  extractTaggedVersions,
  rollupPrereleases,
  splitReleasesFromArray,
  removeFourSegmentVersionsFromArray,
  friendlifyPrereleaseName,
  filterSemverVersions,
  isFixedVersion,
}

// PackageSuggestionFactoryTests
import createSuggestionTags from './factories/packageSuggestionFactory/createSuggestionTags.tests';

export const PackageSuggestionFactoryTests = {
  createSuggestionTags
}


// Package Parser Tests
import extractPackageDependenciesFromJson from './parsers/jsonPackageParser/extractPackageDependenciesFromJson.tests';
import extractPackageDependenciesFromYaml from './parsers/yamlPackageParser/extractPackageDependenciesFromYaml.tests';

export const PackageParserTests = {
  extractPackageDependenciesFromJson,
  extractPackageDependenciesFromYaml,
}