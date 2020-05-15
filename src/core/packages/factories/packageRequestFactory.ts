import * as ResponseFactory from './packageResponseFactory';

import {
  PackageResponse,
  ReplaceVersionFunction
} from '../models/packageResponse';

import { PackageRequest } from "../models/packageRequest";
import { IPackageClient } from '../definitions/iPackageClient';

export async function createPackageRequest<TClientData>(
  client: IPackageClient<TClientData>,
  request: PackageRequest<TClientData>,
  replaceVersionFn: ReplaceVersionFunction,
): Promise<Array<PackageResponse> | PackageResponse> {

  request.logger.info(
    `Queuing %s package: %s`,
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

      return error;
    })
}