import {
  PackageNameVersion,
  PackageVersionStatus,
  PackageTag,
  PackageTagFlags,
  PackageVersionTypes,
  PackagePrereleaseDictionary
} from "../models/packageDocument";

import { SemverSpec } from "../definitions/semverSpec";

export const formatTagNameRegex = /^[^0-9\-]*/;

const loosePrereleases = { loose: true, includePrerelease: true };

export function filterVersionsWithinRange(range: string, versions: Array<string>): Array<string> {
  const { valid, validRange, Range } = require("semver");
  // make sure we have a valid version or range
  if (valid(range) === null && validRange(range) === null) return versions;

  const filterRange = new Range(range, loosePrereleases);
  return versions.filter(function (version: string) {
    return filterRange.test(version)
  });
}

export function filterTagsWithinRange(range: string, tags: Array<PackageNameVersion>): Array<PackageNameVersion> {
  const { valid, validRange, Range } = require("semver");

  // make sure we have a valid version or range
  if (valid(range) === null && validRange(range) === null) return tags;

  const filterRange = new Range(range, loosePrereleases);
  return tags.filter(
    function (pvm: PackageNameVersion) {
      return filterRange.test(pvm.version)
    }
  );
}

export function filterPrereleasesFromDistTags(distTags: { [key: string]: string }): Array<string> {
  const { prerelease } = require("semver");
  const prereleases: Array<string> = [];
  Object.keys(distTags)
    .forEach((key: string) => {
      if (prerelease(distTags[key])) prereleases.push(distTags[key]);
    });

  return prereleases;
}

export function extractVersionsFromMap(versions: Array<PackageNameVersion>): Array<string> {
  return versions.map(function (pnv: PackageNameVersion) {
    return pnv.version;
  });
}

export function extractTaggedVersions(versions: Array<string>): Array<PackageNameVersion> {
  const { prerelease } = require('semver');

  const results: Array<PackageNameVersion> = [];
  versions.forEach(function (version) {
    const prereleaseComponents = prerelease(version);
    const isPrerelease = !!prereleaseComponents && prereleaseComponents.length > 0;
    if (isPrerelease) {
      const regexResult = formatTagNameRegex.exec(prereleaseComponents[0]);
      const name = regexResult[0].toLowerCase();

      results.push({
        name,
        version
      })
    }
  });

  return results;
}

export function splitReleasesFromArray(versions: Array<string>): { releases: Array<string>, prereleases: Array<string> } {
  const { prerelease } = require('semver');
  const releases: Array<string> = [];
  const prereleases: Array<string> = [];

  versions.forEach(function (version: string) {
    if (prerelease(version))
      prereleases.push(version);
    else
      releases.push(version);
  });

  return { releases, prereleases };
}

export function removeFourSegmentVersionsFromArray(versions: Array<string>): Array<string> {
  return versions.filter(function (version: string) {
    return isFourSegmentedVersion(version) === false;
  });
}

export function isFixedVersion(versionToCheck: string): boolean {
  const { Range } = require('semver');
  const testRange = new Range(versionToCheck);
  return testRange.set[0][0].operator === "";
}

const ifourSegmentVersionRegex = /^(\d+\.)(\d+\.)(\d+\.)(\*|\d+)$/g;
export function isFourSegmentedVersion(versionToCheck: string): boolean {
  return ifourSegmentVersionRegex.test(versionToCheck);
}

const commonPrereleaseNames = [
  'alpha', 'a',
  'beta', 'b',
  'final', 'ga',
  'legacy',
  'milestone', 'm',
  'next',
  'snapshot', 'sp',
  'release',
  'rc', 'cr',
];
export function friendlifyPrereleaseName(prereleaseName: string): string {
  const filteredNames = commonPrereleaseNames.filter(
    commonName => new RegExp(`(.+-)${commonName}`, 'i').test(prereleaseName)
  );

  return (filteredNames.length === 0) ?
    null :
    filteredNames[0];
}

export function parseSemver(packageVersion: string): SemverSpec {
  const { valid, validRange } = require('semver');
  const isVersion = valid(packageVersion);
  const isRange = validRange(packageVersion);
  return {
    rawVersion: packageVersion,
    type: !!isVersion ?
      PackageVersionTypes.version :
      !!isRange ? PackageVersionTypes.range :
        null,
  };
}

export function filterPrereleasesWithinRange(versionRange: string, prereleases: Array<string>): Array<string> {
  const { SemVer, maxSatisfying } = require('semver');
  const prereleaseGroupMap: PackagePrereleaseDictionary = {};

  // for each prerelease version;
  // group prereleases by x.x.x-{name*}.x
  prereleases.forEach(function (prereleaseVersion) {
    const spec = new SemVer(prereleaseVersion, loosePrereleases)
    const prereleaseKey = friendlifyPrereleaseName(prereleaseVersion) || spec.prerelease[0];

    prereleaseGroupMap[prereleaseKey] = prereleaseGroupMap[prereleaseKey] || [];
    prereleaseGroupMap[prereleaseKey].push(prereleaseVersion);
  });

  // for each group; 
  // extract maxSatisfying from version array;
  const filterPrereleases = [];
  Object.keys(prereleaseGroupMap)
    .forEach(function (prereleaseKey) {
      const versions = prereleaseGroupMap[prereleaseKey];
      const satisfiesVersion = maxSatisfying(versions, versionRange, loosePrereleases);
      if (satisfiesVersion) filterPrereleases.push(satisfiesVersion)
    });

  return filterPrereleases;
}

export function createVersionTags(versionRange: string, releases: string[], prereleases: string[]): Array<PackageTag> {
  const { maxSatisfying } = require("semver");
  const tags: Array<PackageTag> = [];
  const latestVersion = maxSatisfying(releases, "*");
  const satisfiesVersion = maxSatisfying(releases, versionRange);
  const isLatest = latestVersion === satisfiesVersion;

  // current tag
  if ((releases.length === 0 && prereleases.length === 0) || !satisfiesVersion)
    tags.push({
      name: PackageVersionStatus.nomatch,
      version: '',
      flags: PackageTagFlags.readOnly,
    });
  else if (isLatest) {
    tags.push({
      name: PackageVersionStatus.latest,
      version: '',
      flags: PackageTagFlags.readOnly,
    });
  } else if (satisfiesVersion) {
    if (isFixedVersion(versionRange)) {
      tags.push({
        name: PackageVersionStatus.fixed,
        version: versionRange,
        flags: PackageTagFlags.readOnly,
      });
    }
    else {
      const containsVersion = versionRange.includes(satisfiesVersion);
      tags.push({
        name: PackageVersionStatus.satisifies,
        version: satisfiesVersion,
        flags: containsVersion ? PackageTagFlags.readOnly : PackageTagFlags.updatable
      });
    }
  }

  // include the latest
  if (isLatest === false) {
    tags.push({
      name: PackageVersionStatus.latest,
      version: latestVersion,
      flags: PackageTagFlags.updatable
    });
  }

  // roll up prereleases
  const maxSatisfyingPrereleases = filterPrereleasesWithinRange(versionRange, prereleases);

  // group prereleases
  const taggedVersions = extractTaggedVersions(maxSatisfyingPrereleases);
  taggedVersions.forEach((pvn) => {
    if (pvn.name === 'latest') return;
    if (pvn.version === satisfiesVersion) return;
    if (versionRange.includes(pvn.version)) return;

    let flags: PackageTagFlags = (pvn.name === 'next') ?
      PackageTagFlags.updatable | PackageTagFlags.readOnly :
      PackageTagFlags.updatable;

    tags.push({
      name: pvn.name,
      version: pvn.version,
      flags
    });
  });

  return tags;
}