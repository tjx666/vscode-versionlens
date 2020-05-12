import { FetchRequest } from "core/clients/models/fetch";
import * as ErrorFactory from 'core/clients/errors/factory';
import * as PackageDocumentFactory from 'core/packages/factories/packageDocumentFactory';
import { PackageDocument, PackageSourceTypes } from "core/packages/models/packageDocument";
import { JsonHttpRequest } from 'core/clients/requests/jsonHttpRequest';
import appContrib from 'appContrib';
import { createSuggestionTags } from 'core/packages/factories/packageSuggestionFactory';
import { splitReleasesFromArray, extractVersionsFromMap, parseSemver } from 'core/packages/helpers/versionHelpers';
import { SemverSpec } from 'core/packages/definitions/semverSpec';

const jsonRequest = new JsonHttpRequest({}, 0);

export async function fetchPackage(request: FetchRequest): Promise<PackageDocument> {
  const semverSpec = parseSemver(request.packageVersion);
  return createRemotePackageDocument(request, semverSpec)
    .catch(error => {
      const { response } = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      if (error.status === 404 || response?.status === 404) {
        return PackageDocumentFactory.createNotFound('pub', requested, null);
      }

      if (!response) {
        return Promise.reject(ErrorFactory.createFetchError(request, error, semverSpec))
      }

      return Promise.reject(error);
    });

}

function createRemotePackageDocument(request: FetchRequest, semverSpec: SemverSpec): Promise<PackageDocument> {

  const url = `${appContrib.pubApiUrl}/api/documentation/${request.packageName}`;

  return jsonRequest.getJson(url)
    .then(response => {

      const packageInfo = response.data;

      const versionRange = semverSpec.rawVersion;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      const resolved = {
        name: request.packageName,
        version: versionRange,
      };

      const rawVersions = extractVersionsFromMap(packageInfo.versions);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(rawVersions)

      // analyse suggestions
      const suggestions = createSuggestionTags(versionRange, releases, prereleases);

      // todo return a ~master entry when no matches found
      return {
        provider: 'pub',
        source: PackageSourceTypes.registry,
        type: semverSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        suggestions,
      };

    });
}
