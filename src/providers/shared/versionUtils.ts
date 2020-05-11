import { formatTagNameRegex, sortDescending } from '../../common/utils.js';
import { TaggedVersion, VersionInfo, VersionMap } from './definitions.js';

const semver = require('semver');

export function removeExactVersions(version: string): Array<TaggedVersion> {
  return this.filter((tag: TaggedVersion) => tag.version !== version);
}

export function removeTagsWithName(name: string): Array<TaggedVersion> {
  return this.filter((tag: TaggedVersion) => tag.name !== name);
}

export function removeOlderVersions(versionRange: string): Array<TaggedVersion> {
  return this.filter((tag: TaggedVersion) => !isOlderVersion(tag.version, versionRange));
}

export function resolveVersionAgainstTags(tags: Array<TaggedVersion>, tagName: string, defaultVersion: string): string {
  const tagIndex = tags.findIndex(item => item.name === tagName);
  if (tagIndex > -1)
    return tags[tagIndex].version;
  else
    return defaultVersion;
}

export function parseVersion(version: string): VersionInfo {
  const prereleaseComponents = semver.prerelease(version);
  const isPrerelease = !!prereleaseComponents && prereleaseComponents.length > 0;
  let prereleaseGroup = '';

  if (isPrerelease) {
    const regexResult = formatTagNameRegex.exec(prereleaseComponents[0]);
    if (regexResult)
      prereleaseGroup = regexResult[0].toLowerCase();
  }

  return {
    version,
    isPrerelease,
    prereleaseGroup
  };
}

export function isFixedVersion(versionToCheck: string): boolean {
  const testRange = new semver.Range(versionToCheck);
  return testRange.set[0][0].operator === "";
}

export function isOlderVersion(version: string, requestedVersion: string): boolean {
  let testVersion = version;

  const requestedVersionComponents = semver.prerelease(requestedVersion);
  // check the required version isn't a prerelease
  if (!requestedVersionComponents) {
    // check if the test version is a pre release
    const testVersionComponents = semver.prerelease(testVersion);
    if (testVersionComponents) {
      // strip the test version prerelease info
      // semver always see prereleases as < than releases regardless of version numbering
      testVersion = testVersion.replace('-' + testVersionComponents.join('.'), '');

      // and we only want newer prereleases
      return semver.ltr(testVersion, requestedVersion) || requestedVersion.includes(testVersion);
    }
  }

  return semver.ltr(testVersion, requestedVersion);
}

export function sortTagsByRecentVersion(tagA: TaggedVersion, tagB: TaggedVersion): number {
  const a = tagA.version;
  const b = tagB.version;

  if (semver.lt(a, b))
    return 1;

  if (semver.gt(a, b))
    return -1;

  return sortDescending(tagA.name, tagB.name);
}

export function pluckTagsAndReleases(versions: Array<string>): VersionMap {
  const releases = [];
  const taggedVersions = [];

  // parse each version
  const parsedVersions = versions.map(parseVersion);

  // determine releases and tags
  parsedVersions.forEach((versionInfo: VersionInfo) => {
    if (!versionInfo.isPrerelease) {
      releases.push(versionInfo.version);
      return;
    }

    taggedVersions.push({
      name: versionInfo.prereleaseGroup,
      version: versionInfo.version
    });
  });

  // return the map
  return {
    releases,
    taggedVersions
  };
}

export function reduceTagsByUniqueNames(): Array<any> {
  return this.reduce(
    function (unique, current, currentIndex, original) {
      if (unique.findIndex(x => x.name === current.name) === -1) {
        unique.push(current);
      }

      return unique;
    },
    [] // initial uniqueNames
  );
}

export function removeAmbiguousTagNames(): Array<TaggedVersion> {
  return this.reduce(
    function (results, current, currentIndex, original) {
      let { name, version } = current;

      const regexResult = formatTagNameRegex.exec(name);
      if (!regexResult)
        results.push({
          name,
          version
        })
      else if (regexResult[0].length > 1)
        results.push({
          name: regexResult[0].toLowerCase(),
          version
        });

      return results;
    },
    [] // initial results
  );
}

/**
 * @export
 * @param {Array<TaggedVersion>} taggedVersions 
 * @param {Array<String>} tagNamesToMatch
 * @returns {Array<TaggedVersion>}
 */
export function filterTagsByName(taggedVersions, tagNamesToMatch) {
  // make sure the tag names to match are all lower case
  const lcNamesToMatch = tagNamesToMatch.map(entry => entry.toLowerCase());

  // return the filtered tags
  return taggedVersions.filter(tag => {
    return lcNamesToMatch.includes(tag.name.toLowerCase());
  });
}

export function buildMapFromVersionList(versions: Array<string>, requestedVersion: string): VersionMap {
  // filter out any non semver versions
  const semverList = pluckSemverVersions(versions);

  // pluck the release and tagged versions
  const versionMap = pluckTagsAndReleases(semverList);

  // detemine max satisfying versions
  versionMap.maxSatisfyingVersion = deduceMaxSatisfyingFromSemverList(semverList, requestedVersion)

  return versionMap;
}

export function deduceMaxSatisfyingFromSemverList(semverList: Array<string>, requestedVersion: string): string {
  // see which version the requested version satisfies
  let maxSatisfyingVersion = requestedVersion;
  try {
    maxSatisfyingVersion = semver.maxSatisfying(semverList, requestedVersion);
  } catch (err) { }

  return maxSatisfyingVersion;
}

export function buildTagsFromVersionMap(versionMap: VersionMap, requestedVersion: string): Array<TaggedVersion> {
  // check if this is a valid range
  const isRequestedVersionValid = semver.validRange(requestedVersion);
  const versionMatchNotFound = !versionMap.maxSatisfyingVersion;

  // create the latest release entry
  const latestEntry = {
    name: "latest",
    version: versionMap.releases[0] || versionMap.taggedVersions[0].version,
    // can only be older if a match was found and requestedVersion is a valid range
    isOlderThanRequested: !versionMatchNotFound && isRequestedVersionValid && isOlderVersion(versionMap.releases[0] || versionMap.taggedVersions[0].version, requestedVersion)
  };
  const satisfiesLatest = semver.satisfies(versionMap.maxSatisfyingVersion, latestEntry.version);
  const isFixed = isRequestedVersionValid && isFixedVersion(requestedVersion);
  const isLatestVersion = satisfiesLatest && requestedVersion.replace(/[\^~]/, '') === latestEntry.version;

  // create the satisfies entry
  const satisfiesEntry = {
    name: "satisfies",
    version: versionMap.maxSatisfyingVersion,
    isNewerThanLatest: !satisfiesLatest && versionMap.maxSatisfyingVersion && semver.gt(versionMap.maxSatisfyingVersion, latestEntry.version),
    isLatestVersion,
    satisfiesLatest,
    isInvalid: !isRequestedVersionValid,
    versionMatchNotFound,
    isFixedVersion: isFixed,
    isPrimaryTag: true
  };

  // return an Array<TaggedVersion>
  return [
    satisfiesEntry,

    // only provide the latest when the satisfiesEntry is not the latest
    ...(satisfiesEntry.isLatestVersion ? [] : [latestEntry]),

    // concat all other tags
    ...applyTagFilterRules(
      versionMap.taggedVersions,
      requestedVersion,
      versionMap.maxSatisfyingVersion,
      latestEntry.version,
      versionMatchNotFound
    )
  ];
}

// const versionTagFilterRules = createChainMutator([
//   removeExactVersions,
//   removeOlderVersions,
//   removeTagsWithName,
//   removeAmbiguousTagNames,
//   reduceTagsByUniqueNames
// ]);


export function applyTagFilterRules(
  taggedVersions: Array<TaggedVersion>,
  requestedVersion: string,
  satisifiesVersion: string,
  latestVersion: string,
  versionMatchNotFound: boolean): Array<TaggedVersion> {
  let filterVersions = taggedVersions.slice()

  if (semver.validRange(requestedVersion)) {
    // filter out any pre releases that are older than the requestedVersion
    filterVersions = removeOlderVersions.call(filterVersions, requestedVersion)
  }

  // tags that have the exact same version as the satisifiesVersion are filtered
  filterVersions = removeExactVersions.call(filterVersions, satisifiesVersion)

  // tags that have the exact same version as the latest are filtered
  filterVersions = removeExactVersions.call(filterVersions, latestVersion)

  if (versionMatchNotFound) {
    // if versionMatchNotFound, tags that are older than the latestVersion are filtered
    filterVersions = removeOlderVersions.call(filterVersions, latestVersion)
  }

  // remove ambiguous tag names
  filterVersions = removeAmbiguousTagNames.call(filterVersions)

  // reduce tags to unique names
  filterVersions = reduceTagsByUniqueNames.call(filterVersions)

  // remove any tags named latest
  filterVersions = removeTagsWithName.call(filterVersions, 'latest')

  return filterVersions.sort(sortTagsByRecentVersion)
}