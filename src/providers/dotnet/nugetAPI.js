/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as httpRequest from 'request-light';
import * as semver from 'semver';

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

export function ensureFullVersion(value) {

  if(!value ||
    value.indexOf('[') !== -1 ||
    value.indexOf('(') !== -1 ||
    value.indexOf(',') !== -1 ||
    value.indexOf(')') !== -1 ||
    value.indexOf(']') !== -1)
    return value;

    let dotCount = 0;
    for(let i = 0; i < value.length; i++) {
      const c = value[i];
      if(c === '.')
        dotCount++;
      else if(isNaN(parseInt(c)))
        return value;
    }

    let fmtValue = '';
    if(dotCount === 0)
      fmtValue = value + '.0.0';
    else if(dotCount === 1)
      fmtValue = value + '.0';
    else
      return value;

    return fmtValue;
}

export function parseVersionSpec(value) {
  const formattedValue = ensureFullVersion(value.trim());
  if(!formattedValue)
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

  // Fail early if the string is too short to be valid
  if (formattedValue.length < 3)
    return null;

  // The first character must be [ or (
  switch (formattedValue[0]) {
    case '[':
      versionSpec.isMinInclusive = true;
      break;
    case '(':
      versionSpec.isMinInclusive = false;
      break;
    default:
      return null;
  }

  // The last character must be ] ot )
  switch (formattedValue[formattedValue.length - 1]) {
    case ']':
      versionSpec.isMaxInclusive = true;
      break;
    case ')':
      versionSpec.isMaxInclusive = false;
      break;
    default:
      return null;
  }

  // Get rid of the two brackets
  formattedValue = formattedValue.substring(1, formattedValue.length - 1);

  // Split by comma, and make sure we don't get more than two pieces
  const parts = formattedValue.split(',');
  if (parts.length > 2)
    return null;
  else if (parts.every(x => !x))
    // If all parts are null or empty, then neither of upper or lower bounds were specified. Version spec is of the format (,]
    return null;

  // If there is only one piece, we use it for both min and max
  const minVersionString = parts[0];
  const maxVersionString = (parts.length == 2) ? parts[1] : parts[0];

  // parse the min version
  if (minVersionString) {
    const parsedVersion = parseVersionSpec(minVersionString);
    if (!parsedVersion)
      return null;

    versionSpec.minVersionSpec = parsedVersion;
  }

  // Same for max
  if (maxVersionString) {
    const parsedVersion = parseVersionSpec(maxVersionString);
    if (!parsedVersion)
      return null;

    versionSpec.maxVersionSpec = parsedVersion;
  }

  // Success!
  return versionSpec;
}

export function convertNugetToNodeRange(nugetVersion) {
  let builder = '';

  const nugetVersionSpec = parseVersionSpec(nugetVersion);
  if (!nugetVersionSpec)
    return null;

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