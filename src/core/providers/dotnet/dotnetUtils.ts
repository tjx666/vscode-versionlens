/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isFourSegmentedVersion } from '../../packages/helpers/versionHelpers'
import { PackageVersionTypes } from '../../packages/models/packageDocument';
import { DotNetVersionSpec, NugetVersionSpec } from './models/versionSpec';

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

export function parseVersionSpec(rawVersion: string): DotNetVersionSpec {
  const spec = buildVersionSpec(rawVersion);
  // if (spec && spec.hasFourSegments) return null;

  let version: string;
  let isValidVersion = false;
  let isValidRange = false;

  if (spec && !spec.hasFourSegments) {
    // convert spec to semver
    const semver = require('semver');
    version = convertVersionSpecToString(spec);
    isValidVersion = semver.valid(version);
    isValidRange = !isValidVersion && semver.validRange(version) !== null;
  }

  const type: PackageVersionTypes = isValidVersion ? PackageVersionTypes.version : isValidRange ? PackageVersionTypes.range : null

  const resolvedVersion = spec ? version : '';

  return {
    type,
    rawVersion,
    resolvedVersion,
    spec
  };
}

export function buildVersionSpec(value): NugetVersionSpec {
  let formattedValue = expandShortVersion(value.trim());
  if (!formattedValue) return null;

  // test if the version is in semver format
  const semver = require('semver');
  const parsedSemver = semver.parse(formattedValue);
  if (parsedSemver) {
    return {
      version: formattedValue,
      isMinInclusive: true,
      isMaxInclusive: true,
    };
  }

  try {
    // test if the version is a semver range format
    const parsedNodeRange = semver.validRange(formattedValue);
    if (parsedNodeRange) {
      return {
        version: parsedNodeRange,
        isMinInclusive: true,
        isMaxInclusive: true,
      };
    }
  } catch { }

  // fail if the string is too short
  if (formattedValue.length < 3) return null;

  const versionSpec: NugetVersionSpec = {};

  // first character must be [ or (
  const first = formattedValue[0];
  if (first === '[')
    versionSpec.isMinInclusive = true;
  else if (first === '(')
    versionSpec.isMinInclusive = false;
  else if (isFourSegmentedVersion(formattedValue))
    return { hasFourSegments: true }
  else
    return null;

  // last character must be ] or )
  const last = formattedValue[formattedValue.length - 1];
  if (last === ']')
    versionSpec.isMaxInclusive = true;
  else if (last === ')')
    versionSpec.isMaxInclusive = false;

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
    const parsedVersion = buildVersionSpec(minVersion);
    if (!parsedVersion) return null;

    versionSpec.minVersionSpec = parsedVersion;
    versionSpec.hasFourSegments = parsedVersion.hasFourSegments;
  }

  // parse the max version
  if (maxVersion) {
    const parsedVersion = buildVersionSpec(maxVersion);
    if (!parsedVersion) return null;

    versionSpec.maxVersionSpec = parsedVersion;
    versionSpec.hasFourSegments = parsedVersion.hasFourSegments;
  }

  return versionSpec;
}

function convertVersionSpecToString(versionSpec: NugetVersionSpec) {
  // x.x.x cases
  if (versionSpec.version
    && versionSpec.isMinInclusive
    && versionSpec.isMaxInclusive)
    return versionSpec.version;

  // [x.x.x] cases
  if (versionSpec.minVersionSpec
    && versionSpec.maxVersionSpec
    && versionSpec.minVersionSpec.version === versionSpec.maxVersionSpec.version
    && versionSpec.isMinInclusive
    && versionSpec.isMaxInclusive)
    return versionSpec.minVersionSpec.version;

  let rangeBuilder = '';

  if (versionSpec.minVersionSpec) {
    rangeBuilder += '>';
    if (versionSpec.isMinInclusive)
      rangeBuilder += '=';
    rangeBuilder += versionSpec.minVersionSpec.version
  }

  if (versionSpec.maxVersionSpec) {
    rangeBuilder += rangeBuilder.length > 0 ? ' ' : '';
    rangeBuilder += '<';
    if (versionSpec.isMaxInclusive)
      rangeBuilder += '=';
    rangeBuilder += versionSpec.maxVersionSpec.version
  }

  return rangeBuilder;
}