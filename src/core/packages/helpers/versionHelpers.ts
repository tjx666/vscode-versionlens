import { KeyStringArrayDictionary } from "core/definitions/generics";
import {
  PackageNameVersion,
  PackageVersionTypes,
} from "../models/packageDocument";
import { SemverSpec } from "../definitions/semverSpec";

export const formatTagNameRegex = /^[^0-9\-]*/;
export const loosePrereleases = { loose: true, includePrerelease: true };

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
  const prereleaseGroupMap: KeyStringArrayDictionary = {};

  // for each prerelease version;
  // group prereleases by x.x.x-{name}*.x
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

export function filterSemverVersions(versions: Array<string>): Array<string> {
  const { validRange } = require('semver');
  const semverVersions = [];
  versions.forEach(version => {
    if (validRange(version)) semverVersions.push(version);
  });
  return semverVersions;
}

export const extractSymbolFromVersionRegex = /^([^0-9]*)?.*$/;
export const semverLeadingChars = ['^', '~', '<', '<=', '>', '>=', '~>'];
export function formatWithExistingLeading(existingVersion, newVersion) {
  const regExResult = extractSymbolFromVersionRegex.exec(existingVersion);
  const leading = regExResult && regExResult[1];
  if (!leading || !semverLeadingChars.includes(leading))
    return newVersion;

  return `${leading}${newVersion}`;
}