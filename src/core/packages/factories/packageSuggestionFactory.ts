import {
  PackageVersionStatus,
  PackageSuggestionFlags,
  PackageSuggestion
} from "../models/packageDocument";

import {
  filterPrereleasesWithinRange,
  extractTaggedVersions,
  isFixedVersion
} from "../helpers/versionHelpers";

export function createSuggestionTags(versionRange: string, releases: string[], prereleases: string[]): Array<PackageSuggestion> {
  const { maxSatisfying } = require("semver");
  const suggestions: Array<PackageSuggestion> = [];
  const latestVersion = maxSatisfying(releases, "*");
  const satisfiesVersion = maxSatisfying(releases, versionRange);
  const containsVersion = versionRange.includes(satisfiesVersion);
  const isLatest = latestVersion === satisfiesVersion;
  if (releases.length === 0 && prereleases.length === 0)
    // no match and nothing else to suggest
    suggestions.push(createNoMatch())
  else if (!satisfiesVersion)
    // no match and suggest latest
    suggestions.push(
      createNoMatch(),
      createLatest(latestVersion),
    )
  else if (isLatest && containsVersion)
    // latest
    suggestions.push(createLatest());
  else if (isLatest)
    suggestions.push(
      // satisfies latest
      createSuggestion(
        PackageVersionStatus.satisfies,
        'latest',
        PackageSuggestionFlags.status
      ),
      // updatable to latest@version
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
        // updatable to latest@version
        createLatest(latestVersion),
      );

    } else {

      suggestions.push(
        // satisfies >x.y.z <x.y.z
        createSuggestion(
          PackageVersionStatus.satisfies,
          satisfiesVersion,
          containsVersion ?
            PackageSuggestionFlags.status :
            PackageSuggestionFlags.release
        ),
        // updatable to latest@version
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

    // let flags: PackageTagFlags = (pvn.name === 'next') ?
    //   PackageTagFlags.updatable | PackageTagFlags.readOnly :
    //   PackageTagFlags.updatable;

    suggestions.push({
      name: pvn.name,
      version: pvn.version,
      flags: PackageSuggestionFlags.prerelease
    });
  });

  return suggestions;
}

export function createNotFound(requestedVersion: string): PackageSuggestion {
  return {
    name: PackageVersionStatus.notfound,
    version: requestedVersion,
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

export function createNotSupported(requestedVersion: string): PackageSuggestion {
  return {
    name: PackageVersionStatus.notsupported,
    version: requestedVersion,
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
  // when there is no requestedVersion then use the 'latest' tag
  // otherwise it's the latest release version
  return {
    name: PackageVersionStatus.latest,
    version: requestedVersion || 'latest',
    flags: requestedVersion ? PackageSuggestionFlags.release : PackageSuggestionFlags.tag
  };
}

export function createSuggestion(name: string, version: string, flags: PackageSuggestionFlags): PackageSuggestion {
  return { name, version, flags };
}

