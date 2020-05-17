import * as ResponseFactory from './packageResponseFactory';

import { PackageRequest } from "../definitions/packageRequest";
import { ReplaceVersionFunction } from '../definitions/packageResponse';
import { IPackageClient } from '../definitions/iPackageClient';
import { PackageSuggestionFlags } from '../definitions/packageDocument';
import { PackageResponse } from '../models/packageResponse';

export async function createPackageRequest<TClientData>(
  client: IPackageClient<TClientData>,
  request: PackageRequest<TClientData>,
  replaceVersionFn: ReplaceVersionFunction,
): Promise<Array<PackageResponse> | PackageResponse> {

  request.logger.info(
    `Queued %s package: %s`,
    request.providerName,
    request.package.name
  );

  return client.fetchPackage(request)
    .then(function (document) {

      request.logger.info(
        'Fetched %s package from %s: %s@%s',
        document.provider,
        document.response.source,
        request.package.name,
        request.package.version
      );

      if (request.includePrereleases === false) {
        document.suggestions = document.suggestions.filter(
          suggestion => !(suggestion.flags & PackageSuggestionFlags.prerelease)
        )
      }

      return ResponseFactory.createSuccess(document, replaceVersionFn);
    })
    .catch(function (error: PackageResponse) {

      request.logger.error(
        `Provider: %s\tFunction: %s\tPackage: %O\t Error: %j`,
        error.provider,
        createPackageRequest.name,
        request.package,
        error
      );

      return ResponseFactory.createUnexpected(
        error.provider,
        request.package,
        {
          source: error.response.source,
          status: error.response.status,
          data: 'Unexpected error occurred'
        }
      )

    })
}