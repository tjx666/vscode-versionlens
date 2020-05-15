import * as ErrorFactory from '../../errors/factory';
import * as ResponseFactory from './packageResponseFactory';
import { PackageResponse, ReplaceVersionFunction } from '../models/packageResponse';
import { PackageRequest } from "../models/packageRequest";
import { IPackageClient } from '../definitions/iPackageClient';

export async function createPackageRequest<TClientData>(
  client: IPackageClient<TClientData>,
  request: PackageRequest<TClientData>,
  replaceVersionFn: ReplaceVersionFunction,
): Promise<Array<PackageResponse> | PackageResponse> {

  request.logger.appendLine(`Fetch Pending: ${request.package.name}`)

  return client.fetchPackage(request)
    .then(function (document) {
      request.logger.appendLine(
        `Fetched from ${document.response.source}: ${request.package.name}`
      );

      return ResponseFactory.createSuccess(document, replaceVersionFn);
    })
    .catch(function (error: PackageResponse) {
      request.logger.appendLine(
        `Fetch error from ${error.source}: ${request.package.name}`
      );

      ErrorFactory.createConsoleError(error.provider,
        client.options.providerName,
        request.package.name,
        error
      );

      return error;
    })
}
