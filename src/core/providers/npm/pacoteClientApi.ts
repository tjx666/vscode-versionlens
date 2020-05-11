
import * as ErrorFactory from 'core/clients/errors/factory';
import { FetchRequest } from 'core/clients/models/fetch';
import { filterPrereleasesFromDistTags, createSuggestionTags, filterPrereleasesWithinRange } from '../../packages/helpers/versionHelpers';
import {
  PackageDocument,
  PackageVersionTypes,
  PackageSourceTypes,
  PackageSuggestion,
  PackageSuggestionFlags
} from '../../packages/models/packageDocument';
import * as PackageDocumentFactory from '../../packages/factories/packageDocumentFactory'

export async function fetchPackage(request: FetchRequest): Promise<PackageDocument> {
  const npa = require('npm-package-arg');
  let npaResult;

  try {
    npaResult = npa.resolve(request.packageName, request.packageVersion, request.packagePath);
  } catch (error) {
    return Promise.reject(
      ErrorFactory.createFetchError(
        request,
        { status: error.code, responseText: error.message },
        npaResult
      )
    );
  }

  if (npaResult.type === PackageSourceTypes.directory || npaResult.type === PackageSourceTypes.file)
    return createDirectoryPackageDocument(request.packageName, request.packageVersion, npaResult);

  return createRemotePackageDocument(request, npaResult);
}

function createRemotePackageDocument(request: FetchRequest, npaResult: any): Promise<PackageDocument> {
  const pacote = require('pacote');
  const npmConfig = require('libnpmconfig');

  const requested = {
    name: request.packagePath,
    version: request.packageVersion
  };

  // get npm config
  const npmOpts = npmConfig.read(
    {
      where: request.packagePath,
      fullMetadata: false,
      // 'prefer-online': true,
    },
    {
      cwd: request.packagePath,
    }
  );

  return pacote.packument(npaResult, npmOpts)
    .then(function (packu): PackageDocument {
      const { compareLoose } = require("semver");

      let source: PackageSourceTypes = getSourceFromNpaResult(npaResult);
      let type: PackageVersionTypes = getVersionTypeFromNpaResult(npaResult);
      let versionRange: string = getRangeFromNpaResult(npaResult);
      let gitSpec: any = source === PackageSourceTypes.git ? npaResult.hosted : null


      const distTags = packu['dist-tags'] || {};

      const resolved = {
        name: npaResult.name,
        version: versionRange,
      };

      if (npaResult.type === PackageVersionTypes.alias) resolved.name = npaResult.subSpec.name;

      if (npaResult.type === PackageVersionTypes.tag) {
        versionRange = distTags[requested.version];
        if (!versionRange) return PackageDocumentFactory.createNoMatch(
          'npm', 
          source, 
          type, 
          requested
        );
      }

      // extract releases
      const releases = Object.keys(packu.versions || {}).sort(compareLoose);

      // extract prereleases from dist tags
      const prereleases = filterPrereleasesFromDistTags(packu['dist-tags'] || {}).sort(compareLoose)

      // anaylse and report
      const tags = createSuggestionTags(versionRange, releases, prereleases);

      return {
        provider: 'npm',
        source,
        type,
        requested,
        resolved,
        gitSpec,
        tags,
        releases,
        prereleases,
      };
    })
    .catch(error => {
      const { response, data: npaResult } = error

      if (error.code === 'E404') {
        return PackageDocumentFactory.createNotFound('npm', requested, null);
      }

      if (error.code === 'EINVALIDTAGNAME' || error.message.includes('Invalid comparator:')) {
        return PackageDocumentFactory.createInvalidVersion('npm', requested, null);
      }

      if (error.code === 'EUNSUPPORTEDPROTOCOL') {
        return PackageDocumentFactory.createNotSupported('npm', requested, null);
      }

      if (error.code === 128) {
        return PackageDocumentFactory.createGitFailed('npm', requested, null);
      }

      if (!response) {
        return Promise.reject(
          ErrorFactory.createFetchError(request, response, npaResult)
        );
      }

      return Promise.reject(error);
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
  if (npaResult.type === PackageSourceTypes.git) {
    if (npaResult.gitRange) {
      return npaResult.gitRange;
    } else if (npaResult.gitCommittish) {
      return npaResult.gitCommittish;
    } else {
      return npaResult.rawSpec;
    }
  } else if (npaResult.type === PackageVersionTypes.alias) {
    return npaResult.subSpec.rawSpec;
  } else {
    return npaResult.rawSpec;
  }
}

// factory methods
export const fileDependencyRegex = /^file:(.*)$/;
function createDirectoryPackageDocument(rawName: string, rawVersion: string, npaResult: any): PackageDocument {

  const fileRegExpResult = fileDependencyRegex.exec(rawVersion);
  if (!fileRegExpResult) {
    return PackageDocumentFactory.createInvalidVersion(
      'npm',
      { name: rawName, version: rawVersion },
      npaResult.type
    );
  }

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

  const tags: Array<PackageSuggestion> = [
    { name: 'file://', version: resolved.version, flags: PackageSuggestionFlags.prerelease },
  ]

  return {
    provider: 'npm',
    source,
    type,
    requested,
    resolved,
    tags
  };
}
