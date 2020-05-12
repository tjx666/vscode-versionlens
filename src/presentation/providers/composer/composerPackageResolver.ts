import * as ErrorFactory from 'core/errors/factory';
import { fetchPackage } from 'core/providers/composer/composerApiClient';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { PackageResponse, ReplaceVersionFunction } from 'core/packages/models/packageResponse';
import { FetchRequest } from 'core/clients/models/fetch';

export async function resolveComposerPackage(
  request: FetchRequest,
  replaceVersionFn: ReplaceVersionFunction
): Promise<Array<PackageResponse> | PackageResponse> {

  return await fetchPackage(request)
    .then(ResponseFactory.createSuccess)
    .catch(function (error) {
      const { response } = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      };

      if (response.status === 404) {
        return ResponseFactory.createNotFound('composer', requested);
      }

      ErrorFactory.createConsoleError('composer',
        resolveComposerPackage.name,
        request.packageName,
        error
      );

      return ResponseFactory.createUnexpected(
        'composer',
        requested,
        error
      )
    })
}