import { PackageNameVersion, PackageVersionStatus, PackageTag, PackageTagFlags } from "../models/packageDocument";

export const formatTagNameRegex = /^[^0-9\-]*/;

export function filterVersionsWithinRange(range: string, versions: Array<string>): Array<string> {
  const { valid, validRange, Range } = require("semver");
  // make sure we have a valid version or range
  if (valid(range) === null && validRange(range) === null) return versions;

  const filterRange = new Range(range, { includePrerelease: true, loose: true });
  return versions.filter(function (version: string) {
    return filterRange.test(version)
  });
}

export function filterTagsWithinRange(range: string, tags: Array<PackageNameVersion>): Array<PackageNameVersion> {
  const { valid, validRange, Range } = require("semver");

  // make sure we have a valid version or range
  if (valid(range) === null && validRange(range) === null) return tags;

  const filterRange = new Range(range, { includePrerelease: true, loose: true });
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

export function mapToPnvArray(distTags: { [key: string]: string }): Array<PackageNameVersion> {
  return Object.keys(distTags)
    .map(function (name): PackageNameVersion {
      return {
        name,
        version: distTags[name]
      };
    })
    .sort();
}

export function comparePnvLoose(a: PackageNameVersion, b: PackageNameVersion) {
  const { SemVer } = require('semver');
  return new SemVer(a.version, true).compare(new SemVer(b.version, true))
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
      version: versionRange,
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

  // filter versions to the range
  const prereleasesInRange = filterVersionsWithinRange(versionRange, prereleases);

  // extract named versions and add to report
  const taggedVersions = extractTaggedVersions(prereleasesInRange);
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