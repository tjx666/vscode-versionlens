/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import appSettings from '../../common/appSettings';
import { nugetGetPackageVersions } from './nugetAPI.js';
import { tagFilter } from '../../common/versions';

export function dotnetVersionParser(node, appConfig) {
  const { name, value: requestedVersion } = node;

  // check if its a valid semver, if not could be a tag like latest
  const isValidSemver = semver.validRange(requestedVersion);

  // check if this is a fixed version
  let isFixedVersion = false;
  if (isValidSemver) {
    const testRange = new semver.Range(requestedVersion);
    isFixedVersion = testRange.set[0][0].operator === "";
  }

  return nugetGetPackageVersions(name)
    .then(versions => {
      // get all the tag entries
      let tags = mapVersions(versions, requestedVersion);

      // only show matches and latest entries when showTaggedVersions is false
      // otherwise filter by the appConfig.dotnetTagFilter
      let tagsToProcess;
      if (appSettings.showTaggedVersions === false)
        tagsToProcess = [
          tags[0], // matches entry
          tags[1]  // latest entry
        ];
      else if (appConfig.dotnetTagFilter.length > 0)
        tagsToProcess = tagFilter(tags, ['Matches', 'Latest', ...appConfig.dotnetTagFilter]);
      else
        tagsToProcess = tags;

      // map the tags to packages
      return tagsToProcess.map((tag, index) => {
        const isTaggedVersion = index !== 0;

        const packageInfo = {
          type: 'nuget',
          isValidSemver,
          isFixedVersion,
          tag,
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
  const taggedVersionMap = {};
  const releases = [];

  versions.forEach(version => {
    const components = semver.prerelease(version);

    // if no prerelease components then add to releases
    if (!components || components.length === 0) {
      releases.push(version);
      return;
    }

    // process pre-release
    const taggedVersionName = components[0];

    // format the tag name so it groups things like alpha1, alpha2 to become alpha etc..
    const formattedTagName = stripNumbersFromName(taggedVersionName);
    if (!taggedVersionMap[formattedTagName])
      taggedVersionMap[formattedTagName] = [];

    taggedVersionMap[formattedTagName].push(version);
  });

  // see which version the requested version satisfies
  let matchedVersion = requestedVersion;
  try {
    matchedVersion = semver.maxSatisfying(
      stripNonSemverVersions(releases),
      requestedVersion
    );
    if (!matchedVersion)
      matchedVersion = requestedVersion;
    else if (matchedVersion == requestedVersion) {
      matchedVersion = releases[0];
    }
  } catch (err) {
  }

  // return an Array<TaggedVersion>
  return [
    { name: "Matches", version: matchedVersion },
    { name: "Latest", version: releases[0] },
    // concat any the tagged versions
    ...Object.keys(taggedVersionMap)
      .map((name, index) => {
        return {
          name,
          version: taggedVersionMap[name][0]
        }
      })
  ];
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
