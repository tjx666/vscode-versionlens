import isFixedVersion from './versionUtils/isFixedVersion.tests.js';
import isOlderVersion from './versionUtils/isOlderVersion.tests.js';
import pluckTagsAndReleases from './versionUtils/pluckTagsAndReleases.tests.js';
import parseVersion from './versionUtils/parseVersion.tests.js';
import sortTagsByRecentVersion from './versionUtils/sortTagsByRecentVersion.tests.js';
import removeExactVersions from './versionUtils/removeExactVersions.tests.js';
import removeOlderVersions from './versionUtils/removeOlderVersions.tests.js';
import removeAmbiguousTagNames from './versionUtils/removeAmbiguousTagNames.tests.js';
import filterTagsByName from './versionUtils/filterTagsByName.tests.js';
import buildMapFromVersionList from './versionUtils/buildMapFromVersionList.tests.js';
import buildTagsFromVersionMap from './versionUtils/buildTagsFromVersionMap.tests.js';
import deduceMaxSatisfyingFromSemverList from './versionUtils/deduceMaxSatisfyingFromSemverList.tests.js';
import applyTagFilterRules from './versionUtils/applyTagFilterRules.tests.js';
import resolveVersionAgainstTags from './versionUtils/resolveVersionAgainstTags.tests.js';

export const VersionUtils = {
  isFixedVersion,
  isOlderVersion,
  pluckTagsAndReleases,
  parseVersion,
  sortTagsByRecentVersion,
  removeExactVersions,
  removeOlderVersions,
  removeAmbiguousTagNames,
  filterTagsByName,
  buildMapFromVersionList,
  buildTagsFromVersionMap,
  deduceMaxSatisfyingFromSemverList,
  applyTagFilterRules,
  resolveVersionAgainstTags
};