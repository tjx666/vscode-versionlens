
import * as ErrorFactory from 'core/clients/errors/factory';
import { FetchRequest } from 'core/clients/models/fetch';
import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import { filterPrereleasesFromDistTags } from '../../packages/helpers/versionHelpers';
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

  return new Promise<PackageDocument>(function (resolve, reject) {

    try {
      npaResult = npa.resolve(request.packageName, request.packageVersion, request.packagePath);
    } catch (error) {
      reject(
        ErrorFactory.createFetchError(
          request,
          { status: error.code, responseText: error.message },
          npaResult
        )
      );
      return;
    }

    if (npaResult.type === PackageSourceTypes.directory || npaResult.type === PackageSourceTypes.file)
      resolve(createDirectoryPackageDocument(request.packageName, request.packageVersion, npaResult));
    else
      resolve(createRemotePackageDocument(request, npaResult));

  }).catch(error => {
    const { response, data: npaResult } = error

    const requested = {
      name: request.packageName,
      version: request.packageVersion
    };

    if (!response) {
      return Promise.reject(
        ErrorFactory.createFetchError(request, response, npaResult)
      );
    }

    if (response.status === 'E404') {
      return PackageDocumentFactory.createNotFound('npm', requested, null);
    }

    if (response.status === 'EINVALIDTAGNAME' || response.responseText.includes('Invalid comparator:')) {
      return PackageDocumentFactory.createInvalidVersion('npm', requested, null);
    }

    if (response.status === 'EUNSUPPORTEDPROTOCOL') {
      return PackageDocumentFactory.createNotSupported('npm', requested, null);
    }

    if (response.status === 128) {
      return PackageDocumentFactory.createGitFailed('npm', requested, null);
    }
    return Promise.reject(error);
  });

}

function createRemotePackageDocument(request: FetchRequest, npaResult: any): Promise<PackageDocument> {
  const pacote = require('pacote');
  const npmConfig = require('libnpmconfig');

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

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      const distTags = packu['dist-tags'] || {};

      const resolved = {
        name: npaResult.name,
        version: versionRange,
      };

      if (npaResult.type === PackageVersionTypes.alias) resolved.name = npaResult.subSpec.name;

      // extract releases
      const releases = Object.keys(packu.versions || {}).sort(compareLoose);

      // extract prereleases from dist tags
      const prereleases = filterPrereleasesFromDistTags(packu['dist-tags'] || {}).sort(compareLoose)

      // check if the version requested is a tag. eg latest|next
      if (npaResult.type === PackageVersionTypes.tag) {
        versionRange = distTags[requested.version];
        if (!versionRange) return PackageDocumentFactory.createNoMatch(
          'npm',
          source,
          type,
          requested,
          // suggest the latest release if available
          releases.length > 0 ? releases[releases.length - 1] : null
        );
      }

      // analyse suggestions
      const suggestions = createSuggestionTags(versionRange, releases, prereleases);

      return {
        provider: 'npm',
        source,
        type,
        requested,
        resolved,
        gitSpec,
        suggestions,
        releases,
        prereleases,
      };
    }).catch(error => {
      const response = { responseText: error.message, status: error.code };
      return Promise.reject(ErrorFactory.createFetchError(request, response, npaResult));
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

  const suggestions: Array<PackageSuggestion> = [
    { name: 'file://', version: resolved.version, flags: PackageSuggestionFlags.prerelease },
  ]

  return {
    provider: 'npm',
    source,
    type,
    requested,
    resolved,
    suggestions
  };
}
