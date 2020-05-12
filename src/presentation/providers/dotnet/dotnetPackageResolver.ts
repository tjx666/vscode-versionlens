import * as ErrorFactory from 'core/errors/factory';
import { fetchPackage } from 'core/providers/dotnet/nugetApiClient.js';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { ReplaceVersionFunction, PackageResponse } from 'core/packages/models/packageResponse';
import { FetchRequest } from 'core/clients/models/fetch';

export function resolveDotnetPackage(
  request: FetchRequest,
  replaceVersionFn: ReplaceVersionFunction
): Promise<Array<PackageResponse> | PackageResponse> {

  return fetchPackage(request)
    .then(function (document) {
      return ResponseFactory.createSuccess(document, replaceVersionFn);
    })
    .catch(error => {
      const { request } = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      }

      ErrorFactory.createConsoleError('dotnet',
        resolveDotnetPackage.name,
        requested.name,
        error
      );

      return ResponseFactory.createUnexpected(
        'dotnet',
        requested,
        error
      );

    });

}