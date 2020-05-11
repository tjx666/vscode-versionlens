import {
  PackageDocument,
  PackageVersionTypes,
  PackageSourceTypes,
  PackageTag,
  PackageVersionStatus,
  PackageTagFlags
} from '../../packages/models/packageDocument';

import { filterPrereleasesFromDistTags, createVersionTags } from '../../packages/helpers/versionHelpers';

export async function fetchPackage(packagePath, packageName, packageVersion): Promise<PackageDocument> {
  const npa = require('npm-package-arg');
  let npaResult;

  try {
    npaResult = npa.resolve(packageName, packageVersion, packagePath);
  } catch (reason) {
    return Promise.reject({ npaResult, reason });
  }

  if (npaResult.type === PackageSourceTypes.directory || npaResult.type === PackageSourceTypes.file)
    return createDirectoryPackageDocument(packageName, packageVersion, npaResult);

  return createRemotePackageDocument(packagePath, packageName, packageVersion, npaResult);
}

function createRemotePackageDocument(where: string, rawName: string, rawVersion: string, npaResult: any): Promise<PackageDocument> {
  const pacote = require('pacote');
  const npmConfig = require('libnpmconfig');

  const requested = {
    name: rawName,
    version: rawVersion
  };

  // get npm config
  const npmOpts = npmConfig.read(
    {
      where,
      fullMetadata: false,
      // 'prefer-online': true,
    },
    {
      cwd: where,
    }
  );

  return pacote.packument(npaResult, npmOpts)
    .then(function (packu): PackageDocument {
      const { compareLoose } = require("semver");

      let source: PackageSourceTypes = getSourceFromNpaResult(npaResult);
      let type: PackageVersionTypes = getVersionTypeFromNpaResult(npaResult);
      let versionRange: string = getRangeFromNpaResult(npaResult);
      let gitSpec: any = source === PackageSourceTypes.git ? npaResult.hosted : null

      const resolved = {
        name: npaResult.name,
        version: versionRange,
      };

      if (npaResult.type === "alias") resolved.name = npaResult.subSpec.name;

      // extract releases
      const releases = Object.keys(packu.versions || {}).sort(compareLoose);

      // extract prereleases
      const prereleases = filterPrereleasesFromDistTags(packu['dist-tags'] || {}).sort(compareLoose)

      // anaylse and report
      const tags = createVersionTags(versionRange, releases, prereleases);

      return {
        provider: 'npm',
        source,
        type,
        requested: requested,
        resolved,
        gitSpec,
        tags,
        releases,
        prereleases,
      };
    })
    .catch(reason => {
      if (reason.code === 'E404') {
        return createPackageDocumentNotFound(requested, npaResult);
      }

      if (reason.code === 'EINVALIDTAGNAME' || reason.message.includes('Invalid comparator:')) {
        return createPackageDocumentInvalidVersion(requested, npaResult);
      }

      return Promise.reject({ reason, npaResult });
    });
}

function getSourceFromNpaResult(npaResult): PackageSourceTypes {
  if (npaResult.type === "git")
    return PackageSourceTypes.git;
  else if (npaResult.type === "alias")
    return PackageSourceTypes.registry;
  else
    return PackageSourceTypes.registry;
}

function getVersionTypeFromNpaResult(npaResult): PackageVersionTypes {
  if (npaResult.type === "git") {
    if (npaResult.gitRange)
      return PackageVersionTypes.range;
    else if (npaResult.gitCommittish)
      return PackageVersionTypes.committish;
    else {
      // branch type ?
    }
  }
  else if (npaResult.type === "alias")
    return npaResult.type;
  else
    return npaResult.type;
}

function getRangeFromNpaResult(npaResult): string {
  if (npaResult.type === "git") {
    if (npaResult.gitRange) {
      return npaResult.gitRange;
    } else if (npaResult.gitCommittish) {
      return npaResult.gitCommittish;
    } else {
      return npaResult.rawSpec;
    }
  } else if (npaResult.type === "alias") {
    return npaResult.subSpec.rawSpec;
  } else {
    return npaResult.rawSpec;
  }
}

// factory methods
export const fileDependencyRegex = /^file:(.*)$/;
function createDirectoryPackageDocument(rawName: string, rawVersion: string, npaResult: any): PackageDocument {

  const fileRegExpResult = fileDependencyRegex.exec(rawVersion);
  if (!fileRegExpResult) return createPackageDocumentInvalidVersion({ name: rawName, version: rawVersion }, npaResult);

  const source = PackageSourceTypes.directory;
  const type = PackageVersionTypes.version;

  const requested = {
    name: rawName,
    version: rawVersion,
  };

  const resolved = {
    name: npaResult.name,
    version: fileRegExpResult[1],
  };

  const tags: Array<PackageTag> = [
    { name: 'file://', version: resolved.version, flags: PackageTagFlags.readOnly },
  ]

  return {
    provider: 'npm',
    source,
    type,
    requested: requested,
    resolved,
    tags
  };
}

function createPackageDocumentNotFound(requested, npaResult): PackageDocument {
  const source: PackageSourceTypes = getSourceFromNpaResult(npaResult);
  const type: PackageVersionTypes = getVersionTypeFromNpaResult(npaResult);

  const tags: Array<PackageTag> = [
    { name: PackageVersionStatus.notfound, version: requested.version, flags: PackageTagFlags.readOnly },
    { name: PackageVersionStatus.latest, version: 'latest', flags: PackageTagFlags.updatable | PackageTagFlags.readOnly },
  ]

  return {
    provider: 'npm',
    source,
    type,
    requested: requested,
    resolved: null,
    tags
  };
}

function createPackageDocumentInvalidVersion(requested, npaResult): PackageDocument {
  const source: PackageSourceTypes = getSourceFromNpaResult(npaResult);
  const type: PackageVersionTypes = getVersionTypeFromNpaResult(npaResult);

  const tags: Array<PackageTag> = [
    { name: PackageVersionStatus.invalid, version: requested.version, flags: PackageTagFlags.readOnly },
    { name: PackageVersionStatus.latest, version: 'latest', flags: PackageTagFlags.updatable | PackageTagFlags.readOnly },
  ]

  return {
    provider: 'npm',
    source,
    type,
    requested,
    resolved: null,
    tags
  };
}
