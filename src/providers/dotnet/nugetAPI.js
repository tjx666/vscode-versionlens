/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const httpRequest = require('request-light');
const semver = require('semver');

// TODO allow for mutliple sources
const FEED_URL = 'https://api.nuget.org/v3-flatcontainer';

export function nugetGetPackageVersions(packageName) {

  const queryUrl = `${FEED_URL}/${packageName}/index.json`;
  return new Promise(function (resolve, reject) {
    httpRequest.xhr({ url: queryUrl })
      .then(response => {
        if (response.status != 200) {
          reject({
            status: response.status,
            responseText: response.responseText
          });
          return;
        }

        const pkg = JSON.parse(response.responseText);
        resolve(pkg.versions.reverse());
      }).catch(reject);
  });

}

export function expandShortVersion(value) {
  if (!value ||
    value.indexOf('[') !== -1 ||
    value.indexOf('(') !== -1 ||
    value.indexOf(',') !== -1 ||
    value.indexOf(')') !== -1 ||
    value.indexOf(']') !== -1 ||
    value.indexOf('*') !== -1)
    return value;

  let dotCount = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (c === '.')
      dotCount++;
    else if (isNaN(parseInt(c)))
      return value;
  }

  let fmtValue = '';
  if (dotCount === 0)
    fmtValue = value + '.0.0';
  else if (dotCount === 1)
    fmtValue = value + '.0';
  else
    return value;

  return fmtValue;
}

export function parseVersionSpec(value) {
  const formattedValue = expandShortVersion(value.trim());
  if (!formattedValue)
    return null;

  const parsedSemver = semver.parse(formattedValue);
  if (parsedSemver) {
    return {
      version: formattedValue,
      isMinInclusive: true,
      isMaxInclusive: true
    };
  }

  const versionSpec = {};

  // fail if the string is too short
  if (formattedValue.length < 3)
    return null;

  // first character must be [ or (
  const first = formattedValue[0];
  if (first === '[')
    versionSpec.isMinInclusive = true;
  else if (first === '(')
    versionSpec.isMinInclusive = false;
  else
    return null;

  // last character must be ] or )
  const last = formattedValue[formattedValue.length - 1];
  if (last === ']')
    versionSpec.isMaxInclusive = true;
  else if (last === ')')
    versionSpec.isMaxInclusive = false;
  else null;

  // remove any [] or ()
  formattedValue = formattedValue.substring(1, formattedValue.length - 1);

  // split by comma
  const parts = formattedValue.split(',');

  // more than 2 is invalid
  if (parts.length > 2)
    return null;
  else if (parts.every(x => !x))
    // must be (,]
    return null;

  // if only one entry then use it for both min and max
  const minVersion = parts[0];
  const maxVersion = (parts.length == 2) ? parts[1] : parts[0];

  // parse the min version
  if (minVersion) {
    const parsedVersion = parseVersionSpec(minVersion);
    if (!parsedVersion)
      return null;

    versionSpec.minVersionSpec = parsedVersion;
  }

  // parse the max version
  if (maxVersion) {
    const parsedVersion = parseVersionSpec(maxVersion);
    if (!parsedVersion)
      return null;

    versionSpec.maxVersionSpec = parsedVersion;
  }

  return versionSpec;
}

export function convertNugetToNodeRange(nugetVersion) {
  let builder = '';

  const nugetVersionSpec = parseVersionSpec(nugetVersion);
  if (!nugetVersionSpec) {

    // handle basic floating ranges
    const validNodeRange = semver.validRange(nugetVersion);
    if (validNodeRange)
      return validNodeRange;

    return null;
  }

  // x.x.x cases
  if (nugetVersionSpec.version
    && nugetVersionSpec.isMinInclusive
    && nugetVersionSpec.isMaxInclusive)
    return `${nugetVersionSpec.version}`;

  // [x.x.x] cases
  if (nugetVersionSpec.minVersionSpec
    && nugetVersionSpec.maxVersionSpec
    && nugetVersionSpec.minVersionSpec.version === nugetVersionSpec.maxVersionSpec.version
    && nugetVersionSpec.isMinInclusive
    && nugetVersionSpec.isMaxInclusive)
    return `${nugetVersionSpec.minVersionSpec.version}`;


  if (nugetVersionSpec.minVersionSpec) {
    builder += '>';
    if (nugetVersionSpec.isMinInclusive)
      builder += '=';
    builder += nugetVersionSpec.minVersionSpec.version
  }

  if (nugetVersionSpec.maxVersionSpec) {
    builder += builder.length > 0 ? ' ' : '';
    builder += '<';
    if (nugetVersionSpec.isMaxInclusive)
      builder += '=';
    builder += nugetVersionSpec.maxVersionSpec.version
  }

  return builder;
}