import * as ErrorFactory from 'core/errors/factory';
import { fetchPackage } from 'core/providers/dub/dubApiClient';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { ReplaceVersionFunction, PackageResponse } from 'core/packages/models/packageResponse';
import { FetchError, FetchRequest } from 'core/clients/models/fetch';

export async function resolveDubPackage(
  request: FetchRequest,
  replaceVersionFn: ReplaceVersionFunction
): Promise<Array<PackageResponse> | PackageResponse> {

  return fetchPackage(request)
    .then(function (pack) {
      return ResponseFactory.createSuccess(pack, null);
    })
    .catch(function (error) {
      const { request, response }: FetchError = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      }

      // show the 404 to the user; otherwise throw the error
      if (response.status === 404) {
        return ResponseFactory.createNotFound('dub', requested);
      }

      ErrorFactory.createConsoleError('dub',
        resolveDubPackage.name,
        requested.name,
        error
      );

      return ResponseFactory.createUnexpected(
        'dub',
        requested,
        error
      );
    })
}