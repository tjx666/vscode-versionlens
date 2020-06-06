import { ClientResponseSource, HttpClientResponse } from 'core.clients';
import { TPackageSuggestion } from "core.suggestions";

import { TPackageResponseStatus } from "../definitions/tPackageResponseStatus";
import { PackageResponseErrors } from "../definitions/ePackageResponseErrors";
import { TPackageRequest } from "../definitions/tPackageRequest";
import { TPackageDocument } from "../definitions/tPackageDocument";
import { PackageResponse } from "../models/packageResponse";

export function createResponseStatus(source: ClientResponseSource, status: number): TPackageResponseStatus {
  return {
    source,
    status
  };
}

export function createSuccess<TClientData>(
  request: TPackageRequest<TClientData>,
  response: TPackageDocument
): Array<PackageResponse> {
  // map the documents to responses
  return response.suggestions.map(
    function (suggestion: TPackageSuggestion, order: number): PackageResponse {
      return {
        providerName: response.providerName,
        source: response.source,
        type: response.type,
        nameRange: request.dependency.nameRange,
        versionRange: request.dependency.versionRange,
        order,
        requested: response.requested,
        resolved: response.resolved,
        suggestion,
      };
    }
  );
}

export function createUnexpected<TClientData>(
  providerName: string,
  request: TPackageRequest<TClientData>,
  response: HttpClientResponse
): PackageResponse {
  const { nameRange, versionRange } = request.dependency;
  const error: PackageResponse = {
    providerName,
    nameRange,
    versionRange,
    order: 0,
    requested: request.package,
    error: PackageResponseErrors.Unexpected,
    errorMessage: response.data,
    response
  };
  return error;
}