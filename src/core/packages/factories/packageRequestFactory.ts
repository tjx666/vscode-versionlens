import * as ErrorFactory from '../../errors/factory';
import * as ResponseFactory from './packageResponseFactory';
import { PackageResponse, ReplaceVersionFunction } from '../models/packageResponse';
import { PackageRequest, PackageRequestFunction } from "../models/packageRequest";

export function createPackageRequest(
  request: PackageRequest,
  requestFn: PackageRequestFunction,
  replaceVersionFn: ReplaceVersionFunction,
): Promise<Array<PackageResponse> | PackageResponse> {

  request.logger.appendLine(`Fetch Pending: ${request.package.name}`)

  return requestFn(request)
    .then(function (document) {
      request.logger.appendLine(`Fetched from ${document.response.source}: ${request.package.name}`)
      return ResponseFactory.createSuccess(document, replaceVersionFn);
    })
    .catch(function (error: PackageResponse) {
      request.logger.appendLine(`Fetch error from ${error.source}: ${request.package.name}`)

      ErrorFactory.createConsoleError(error.provider,
        requestFn.name,
        request.package.name,
        error
      );

      return error;
    })
}
