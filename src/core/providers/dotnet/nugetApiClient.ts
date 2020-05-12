import * as ErrorFactory from 'core/clients/errors/factory';
import * as PackageDocumentFactory from 'core/packages/factories/packageDocumentFactory';
import { PackageDocument, PackageSourceTypes, PackageVersionTypes } from 'core/packages/models/packageDocument';
import { FetchRequest } from 'core/clients/models/fetch';
import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import {
  splitReleasesFromArray,
  filterSemverVersions,
} from 'core/packages/helpers/versionHelpers';
import { parseVersionSpec } from './dotnetUtils.js';
import { DotNetVersionSpec } from './definitions/versionSpec';

export async function fetchPackage(request: FetchRequest): Promise<PackageDocument> {
  const dotnetSpec = parseVersionSpec(request.packageVersion);
  // const nugetFeeds = 
  // const queryUrl = `${feed}?id=${packageName}&prerelease=${appContrib.dotnetIncludePrerelease}&semVerLevel=2.0.0`;
  // const nugetResult = resolveNuget()

  return createRemotePackageDocument(request, dotnetSpec);
}

function createRemotePackageDocument(request: FetchRequest, dotnetSpec: DotNetVersionSpec): Promise<PackageDocument> {
  const url = `https://azuresearch-usnc.nuget.org/autocomplete?id=${request.packageName}&prerelease=true&semVerLevel=2.0.0`;

  const httpRequest = require('request-light')
  return httpRequest.xhr({ url })
    .then(response => {
      if (response.status != 200) {
        return Promise.reject(ErrorFactory.createFetchError(request, response, dotnetSpec));
      }

      const source = PackageSourceTypes.registry;

      const packageInfo = JSON.parse(response.responseText);
      if (packageInfo.totalHits === 0) {
        return Promise.reject(ErrorFactory.createFetchError(
          request,
          { responseText: '', status: 404 },
          dotnetSpec
        ));
      }

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      // sanitize to semver only versions
      const rawVersions = filterSemverVersions(packageInfo.data);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(rawVersions)

      // four segment is not supported
      if (dotnetSpec.spec && dotnetSpec.spec.hasFourSegments) {
        return Promise.resolve(PackageDocumentFactory.createFourSegment(
          'dotnet',
          requested,
          dotnetSpec.type,
        ))
      }

      // no match if null type
      if (dotnetSpec.type === null) {
        return Promise.resolve(PackageDocumentFactory.createNoMatch(
          'dotnet',
          source,
          PackageVersionTypes.version,
          requested,
          // suggest the latest release if available
          releases.length > 0 ? releases[releases.length - 1] : null,
        ))
      }



      const versionRange = dotnetSpec.resolvedVersion;

      const resolved = {
        name: request.packageName,
        version: versionRange,
      };

      // analyse suggestions
      const suggestions = createSuggestionTags(versionRange, releases, prereleases);

      return {
        provider: 'dotnet',
        source,
        type: dotnetSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        suggestions,
      };
    })
    .catch(error => {
      const { response } = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      if (error.status === 404 || response?.status === 404) {
        return PackageDocumentFactory.createNotFound('dotnet', requested, null);
      }

      if (!response) return Promise.reject(ErrorFactory.createFetchError(request, error, dotnetSpec))

      return Promise.reject(error);
    });

}