import {
  PackageVersionStatus,
  PackageSuggestionFlags,
  PackageSuggestion
} from "../definitions/packageDocument";

import {
  filterPrereleasesGtMinRange,
  extractTaggedVersions,
  isFixedVersion,
  loosePrereleases
} from "../helpers/versionHelpers";

export function createSuggestionTags(
  versionRange: string,
  releases: string[],
  prereleases: string[],
  suggestedLatestVersion: string = null
): Array<PackageSuggestion> {
  const { maxSatisfying, compareLoose } = require("semver");
  const suggestions: Array<PackageSuggestion> = [];

  // check for a release
  let satisfiesVersion = maxSatisfying(releases, versionRange, loosePrereleases);
  if (!satisfiesVersion && versionRange.indexOf('-') > -1) {
    // lookup prereleases
    satisfiesVersion = maxSatisfying(prereleases, versionRange, loosePrereleases);
  }

  // get the latest release
  const latestVersion = suggestedLatestVersion || releases[releases.length - 1];
  const isLatest = latestVersion === satisfiesVersion;

  const noSuggestionNeeded = versionRange.includes(satisfiesVersion) ||
    versionRange.includes(suggestedLatestVersion);

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
    suggestions.push(createMatchesLatest(versionRange));
  else if (isLatest)
    suggestions.push(
      // satisfies latest
      createSatisifiesLatest(),
      // suggest latestVersion
      createLatest(latestVersion),
    );
  else if (satisfiesVersion && isFixedVersion(versionRange))
    suggestions.push(
      // fixed
      createFixedStatus(versionRange),
      // suggest latestVersion
      createLatest(latestVersion),
    );
  else if (satisfiesVersion)
    suggestions.push(
      // satisfies >x.y.z <x.y.z
      createSuggestion(
        PackageVersionStatus.Satisfies,
        satisfiesVersion,
        noSuggestionNeeded ?
          PackageSuggestionFlags.status :
          PackageSuggestionFlags.release
      ),
      // suggest latestVersion
      createLatest(latestVersion),
    );

  // roll up prereleases
  const maxSatisfyingPrereleases = filterPrereleasesGtMinRange(
    versionRange,
    prereleases
  ).sort(compareLoose);

  // group prereleases (latest first)
  const taggedVersions = extractTaggedVersions(maxSatisfyingPrereleases);
  for (let index = taggedVersions.length - 1; index > -1; index--) {
    const pvn = taggedVersions[index];
    if (pvn.name === 'latest') break;
    if (pvn.version === satisfiesVersion) break;
    if (pvn.version === latestVersion) break;
    if (versionRange.includes(pvn.version)) break;

    suggestions.push({
      name: pvn.name,
      version: pvn.version,
      flags: PackageSuggestionFlags.prerelease
    });
  }

  return suggestions;
}

export function createNotFound(): PackageSuggestion {
  return {
    name: PackageVersionStatus.NotFound,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createConnectionRefused(): PackageSuggestion {
  return {
    name: PackageVersionStatus.ConnectionRefused,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createForbidden(): PackageSuggestion {
  return {
    name: PackageVersionStatus.Forbidden,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createNotAuthorized(): PackageSuggestion {
  return {
    name: PackageVersionStatus.NotAuthorized,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createInvalid(requestedVersion: string): PackageSuggestion {
  return {
    name: PackageVersionStatus.Invalid,
    version: requestedVersion,
    flags: PackageSuggestionFlags.status
  };
}

export function createNotSupported(): PackageSuggestion {
  return {
    name: PackageVersionStatus.NotSupported,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createNoMatch(): PackageSuggestion {
  return {
    name: PackageVersionStatus.NoMatch,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createLatest(requestedVersion?: string): PackageSuggestion {
  const isPrerelease = requestedVersion && requestedVersion.indexOf('-') !== -1;

  const name = isPrerelease ?
    PackageVersionStatus.LatestIsPrerelease :
    PackageVersionStatus.Latest;

  // treats requestedVersion as latest version
  // if no requestedVersion then uses the 'latest' tag instead
  return {
    name,
    version: requestedVersion || 'latest',
    flags:
      isPrerelease ?
        PackageSuggestionFlags.prerelease :
        requestedVersion ?
          PackageSuggestionFlags.release :
          PackageSuggestionFlags.tag
  };
}

export function createMatchesLatest(latestVersion: string): PackageSuggestion {
  const isPrerelease = latestVersion && latestVersion.indexOf('-') !== -1;

  const name = isPrerelease ?
    PackageVersionStatus.LatestIsPrerelease :
    PackageVersionStatus.Latest;

  return {
    name,
    version: isPrerelease ? latestVersion : '',
    flags: PackageSuggestionFlags.status
  };


}

export function createSatisifiesLatest(): PackageSuggestion {
  return createSuggestion(
    PackageVersionStatus.Satisfies,
    'latest',
    PackageSuggestionFlags.status
  )
}

export function createFixedStatus(version: string): PackageSuggestion {
  return createSuggestion(
    PackageVersionStatus.Fixed,
    version,
    PackageSuggestionFlags.status
  );
}

export function createSuggestion(
  name: string, version: string, flags: PackageSuggestionFlags
): PackageSuggestion {
  return { name, version, flags };
}
