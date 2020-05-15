import {
  PackageVersionStatus,
  PackageSuggestionFlags,
  PackageSuggestion
} from "../models/packageDocument";

import {
  filterPrereleasesWithinRange,
  extractTaggedVersions,
  isFixedVersion,
  loosePrereleases
} from "../helpers/versionHelpers";

export function createSuggestionTags(
  versionRange: string,
  releases: string[],
  prereleases: string[]
): Array<PackageSuggestion> {
  const { maxSatisfying } = require("semver");
  const suggestions: Array<PackageSuggestion> = [];

  // check for a release
  let satisfiesVersion = maxSatisfying(releases, versionRange, loosePrereleases);
  if (!satisfiesVersion) {
    // lookup prereleases
    satisfiesVersion = maxSatisfying(prereleases, versionRange, loosePrereleases);
  }

  // get the latest release
  const latestVersion = maxSatisfying(releases, "*");
  const isLatest = latestVersion === satisfiesVersion;
  const noSuggestionNeeded = versionRange.includes(satisfiesVersion);

  if (releases.length === 0 && prereleases.length === 0)
    // no match
    suggestions.push(createNoMatch())
  else if (!satisfiesVersion)
    // no match
    suggestions.push(
      createNoMatch(),
      // suggest latestVersion
      createLatest(latestVersion),
    )
  else if (isLatest && noSuggestionNeeded)
    // latest
    suggestions.push(createLatestStatus());
  else if (isLatest)
    suggestions.push(
      // satisfies latest
      createSuggestion(
        PackageVersionStatus.satisfies,
        'latest',
        PackageSuggestionFlags.status
      ),
      // suggest latestVersion
      createLatest(latestVersion),
    );
  else if (satisfiesVersion) {

    if (isFixedVersion(versionRange)) {

      suggestions.push(
        // fixed
        createSuggestion(
          PackageVersionStatus.fixed,
          versionRange,
          PackageSuggestionFlags.status
        ),
        // suggest latestVersion
        createLatest(latestVersion),
      );

    } else {

      suggestions.push(
        // satisfies >x.y.z <x.y.z
        createSuggestion(
          PackageVersionStatus.satisfies,
          satisfiesVersion,
          noSuggestionNeeded ?
            PackageSuggestionFlags.status :
            PackageSuggestionFlags.release
        ),
        // suggest latestVersion
        createLatest(latestVersion),
      );

    }

  }

  // roll up prereleases
  const maxSatisfyingPrereleases = filterPrereleasesWithinRange(versionRange, prereleases);

  // group prereleases
  const taggedVersions = extractTaggedVersions(maxSatisfyingPrereleases);
  taggedVersions.forEach((pvn) => {
    if (pvn.name === 'latest') return;
    if (pvn.version === satisfiesVersion) return;
    if (versionRange.includes(pvn.version)) return;

    suggestions.push({
      name: pvn.name,
      version: pvn.version,
      flags: PackageSuggestionFlags.prerelease
    });
  });

  return suggestions;
}

export function createNotFound(): PackageSuggestion {
  return {
    name: PackageVersionStatus.notfound,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createInvalid(requestedVersion: string): PackageSuggestion {
  return {
    name: PackageVersionStatus.invalid,
    version: requestedVersion,
    flags: PackageSuggestionFlags.status
  };
}

export function createNotSupported(): PackageSuggestion {
  return {
    name: PackageVersionStatus.notsupported,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createNoMatch(): PackageSuggestion {
  return {
    name: PackageVersionStatus.nomatch,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createLatest(requestedVersion?: string): PackageSuggestion {
  // treats requestedVersion as latest version
  // if no requestedVersion then uses the 'latest' tag instead
  return {
    name: PackageVersionStatus.latest,
    version: requestedVersion || 'latest',
    flags: requestedVersion ? PackageSuggestionFlags.release : PackageSuggestionFlags.tag
  };
}

export function createLatestStatus(): PackageSuggestion {
  return {
    name: PackageVersionStatus.latest,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createSuggestion(name: string, version: string, flags: PackageSuggestionFlags): PackageSuggestion {
  return { name, version, flags };
}

