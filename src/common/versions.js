/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import { flatMap } from './utils';

/*
* tags: Array<TaggedVersion>
* tagFilter: Array<string>
*/
export function tagFilter(tags, tagFilter) {
  // just show all distTags if no filters found
  if (!tagFilter || tagFilter.length === 0)
    return tags;

  // get the dist tag filter from the config
  const tagFilters = tagFilter.map(entry => entry.toLowerCase()); // make sure the filters are all lower case

  // if there isn't any tags in the filter then return all of them
  if (tagFilters.length === 0)
    return tags;

  // return the filtered tags
  return tags.filter(tag => {
    const checkTagName = tag.name.toLowerCase();
    return tagFilters.includes(checkTagName);
  });
}

/*
* versions: Array<String>
* requestedVersion: String
*/
export function mapTaggedVersions(versions, requestedVersion) {
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
      stripNonSemverVersions([
        ...releases,
        ...flatMap(Object.keys(taggedVersionMap), key => taggedVersionMap[key])
      ]),
      requestedVersion
    );
  } catch (err) {

    console.log(err);
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

export function isFixedVersion(versionToCheck) {
  const testRange = new semver.Range(versionToCheck);
  return testRange.set[0][0].operator === "";
}

function stripNumbersFromName(tagName) {
  let pos = tagName.length - 1;
  while (pos >= 0 && (tagName[pos] === '-' || isNaN(Number.parseInt(tagName[pos])) == false)) {
    pos--;
  }

  return tagName.substring(0, pos + 1);
}

function stripNonSemverVersions(versions) {
  const semverVersions = [];
  versions.forEach(version => {
    if (semver.validRange(version))
      semverVersions.push(version);
  });
  return semverVersions;
}