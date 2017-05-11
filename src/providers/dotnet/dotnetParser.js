/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import appSettings from '../../common/appSettings';
import { nugetGetPackageVersions } from './nugetAPI.js';

export function dotnetVersionParser(node, appConfig) {
  const { name, value: requestedVersion } = node;

  // check if its a valid semver, if not could be a tag like latest
  const isValidSemver = semver.validRange(requestedVersion);

  return nugetGetPackageVersions(name)
    .then(versions => {
      const versionMap = mapVersions(versions, requestedVersion);
      const taggedNames = Object.keys(versionMap.taggedVersions);

      if (appSettings.showTaggedVersions === false)
        taggedNames = [
          taggedNames[0]
        ];

      return taggedNames
        .map((tagName, index) => {
          const taggedVersions = versionMap.taggedVersions[tagName];
          const latestVersion = versionMap.versions[0];
          const latestTagVersion = taggedVersions[0];
          const isTaggedVersion = index !== 0;

          const packageInfo = {
            type: 'nuget',
            isValidSemver,
            distTag: {
              name: tagName,
              version: isTaggedVersion ? latestTagVersion : latestVersion
            },
            isTaggedVersion
          };

          return {
            node,
            package: {
              name,
              version: requestedVersion,
              meta: packageInfo
            }
          };

        });

    });
}

function mapVersions(versions, requestedVersion) {
  const mapped = {
    taggedVersions: {
      __matches: [],
      // add the latest as a tagged version
      latest: []
    },
    versions: []
  };

  versions.forEach(version => {
    const components = semver.prerelease(version);

    // check if this has any prerelease components
    if (!components || components.length === 0) {
      mapped.versions.push(version);
      return;
    }

    const taggedVersionName = components[0];
    const strippedName = stripNumbersFromName(taggedVersionName);

    if (!mapped.taggedVersions[strippedName])
      mapped.taggedVersions[strippedName] = [];

    mapped.taggedVersions[strippedName].push(version);
  });

  const latestVersion = mapped.versions[0];
  let matchedVersion = requestedVersion;

  try {
    matchedVersion = semver.maxSatisfying(
      stripNonSemverVersions(mapped.versions),
      requestedVersion
    );
    if (!matchedVersion)
      matchedVersion = requestedVersion;
    else if (matchedVersion == requestedVersion) {
      matchedVersion = latestVersion;
    }
  } catch (err) {
  }

  mapped.taggedVersions.__matches.push(matchedVersion);
  mapped.taggedVersions.latest.push(latestVersion);

  return mapped;
}

function stripNumbersFromName(tagName) {
  let pos = tagName.length - 1;
  while (pos >= 0 && (tagName[pos] === '-' || isNaN(Number.parseInt(tagName[pos])) == false)) {
    pos--;
  }

  return tagName.substring(tagName, pos + 1);
}

function stripNonSemverVersions(versions) {

  const semverVersions = [];
  versions.forEach(version => {
    if (semver.validRange(version))
      semverVersions.push(version);
  });
  return semverVersions;
}