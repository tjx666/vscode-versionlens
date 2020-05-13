import * as DocumentFactory from 'core/packages/factories/packageDocumentFactory';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { PackageDocument, PackageSourceTypes, PackageVersionTypes } from 'core/packages/models/packageDocument';
import { PackageRequest } from "core/packages/models/packageRequest";
import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import { splitReleasesFromArray, filterSemverVersions } from 'core/packages/helpers/versionHelpers';
import { parseVersionSpec } from './dotnetUtils.js';
import { DotNetVersionSpec } from './definitions/versionSpec';
import { HttpRequestMethods, HttpResponse } from 'core/clients/requests/httpRequest.js';
import { JsonHttpRequest } from 'core/clients/requests/jsonHttpRequest.js';
import DotnetConfig from './config';

const jsonRequest = new JsonHttpRequest({}, 0);

export async function fetchDotnetPackage(request: PackageRequest): Promise<PackageDocument> {
  const dotnetSpec = parseVersionSpec(request.package.version);
  //TODO: resolve url via service locator from sources
  return createRemotePackageDocument(request, dotnetSpec)
    .catch((error: HttpResponse) => {
      if (error.status === 404) {
        return DocumentFactory.createNotFound(
          DotnetConfig.provider,
          request.package,
          null
        );
      }

      return Promise.reject(error);
    });
}

function createRemotePackageDocument(request: PackageRequest, dotnetSpec: DotNetVersionSpec): Promise<PackageDocument> {
  const url = DotnetConfig.getNuGetFeeds()[0];

  const queryParams = {
    id: request.package.name,
    prerelease: 'true',
    semVerLevel: '2.0.0',
  };

  return jsonRequest.requestJson(HttpRequestMethods.get, url, queryParams)
    .then(httpResponse => {

      const { data } = httpResponse;

      if (data.totalHits === 0) {
        return Promise.reject({ status: 404, data })
      }

      const packageInfo = data;

      const source = PackageSourceTypes.registry;

      const requested = request.package;

      const response = {
        source: httpResponse.source,
        status: httpResponse.status,
      };

      // sanitize to semver only versions
      const rawVersions = filterSemverVersions(packageInfo.data);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(rawVersions)

      // four segment is not supported
      if (dotnetSpec.spec && dotnetSpec.spec.hasFourSegments) {
        return Promise.resolve(DocumentFactory.createFourSegment(
          DotnetConfig.provider,
          requested,
          dotnetSpec.type,
        ))
      }

      // no match if null type
      if (dotnetSpec.type === null) {
        return Promise.resolve(DocumentFactory.createNoMatch(
          DotnetConfig.provider,
          source,
          PackageVersionTypes.version,
          requested,
          // suggest the latest release if available
          releases.length > 0 ? releases[releases.length - 1] : null,
        ))
      }

      const versionRange = dotnetSpec.resolvedVersion;

      const resolved = {
        name: requested.name,
        version: versionRange,
      };

      // analyse suggestions
      const suggestions = createSuggestionTags(versionRange, releases, prereleases);

      return {
        provider: DotnetConfig.provider,
        source,
        response,
        type: dotnetSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        suggestions,
      };
    });
}