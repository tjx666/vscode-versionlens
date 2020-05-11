import filterVersionsWithinRange from './helpers/versionHelpers/filterVersionsWithinRange.tests';
import filterTagsWithinRange from './helpers/versionHelpers/filterTagsWithinRange.tests';
import extractTaggedVersions from './helpers/versionHelpers/extractTaggedVersions.tests';
import rollupPrereleases from './helpers/versionHelpers/filterPrereleasesWithinRange.tests';
import splitReleasesFromArray from './helpers/versionHelpers/splitReleasesFromArray.tests';
import removeFourSegmentVersionsFromArray from './helpers/versionHelpers/removeFourSegmentVersionsFromArray.tests';
import friendlifyPrereleaseName from './helpers/versionHelpers/friendlifyPrereleaseName.tests';
import filterSemverVersions from './helpers/versionHelpers/filterSemverVersions.tests';
import createSuggestionTags from './helpers/versionHelpers/createSuggestionTags.tests';

export const VersionHelperTests = {
  filterVersionsWithinRange,
  filterTagsWithinRange,
  extractTaggedVersions,
  rollupPrereleases,
  splitReleasesFromArray,
  removeFourSegmentVersionsFromArray,
  friendlifyPrereleaseName,
  filterSemverVersions,
  createSuggestionTags,
}