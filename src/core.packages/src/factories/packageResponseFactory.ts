import { ClientResponseSource, HttpClientResponse } from 'core.clients';
import { PackageResponseErrors, PackageResponseStatus } from "../definitions/packageResponse";
import { PackageRequest } from "../definitions/packageRequest";
import { PackageDocument, PackageSuggestion } from "../definitions/packageDocument";
import { PackageResponse } from "../models/packageResponse";

export function createResponseStatus(source: ClientResponseSource, status: number): PackageResponseStatus {
  return {
    source,
    status
  };
}

export function createSuccess<TClientData>(
  request: PackageRequest<TClientData>,
  response: PackageDocument
): Array<PackageResponse> {
  // map the documents to responses
  return response.suggestions.map(function (suggestion: PackageSuggestion, order: number): PackageResponse {
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
  });
}

export function createUnexpected<TClientData>(
  providerName: string,
  request: PackageRequest<TClientData>,
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