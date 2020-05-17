import { ClientResponseSource, HttpClientResponse } from "core/clients";
import {
  PackageResponseErrors,
  ReplaceVersionFunction,
  PackageResponseStatus,
} from "../definitions/packageResponse";
import { PackageIdentifier } from "../definitions/packageRequest";
import { PackageDocument, PackageSuggestion } from "../definitions/packageDocument";
import { PackageResponse } from "../models/packageResponse";

export function createResponseStatus(source: ClientResponseSource, status: number): PackageResponseStatus {
  return {
    source,
    status
  };
}

export function createSuccess(document: PackageDocument, replaceVersionFn: ReplaceVersionFunction): Array<PackageResponse> {
  // map the documents to responses
  return document.suggestions.map(function (suggestion: PackageSuggestion): PackageResponse {
    return {
      providerName: document.providerName,
      source: document.source,
      type: document.type,
      requested: document.requested,
      resolved: document.resolved,
      suggestion,
      replaceVersionFn
    };
  });
}

export function createNotSupported(providerName: string, requested: PackageIdentifier): PackageResponse {
  const error: PackageResponse = {
    providerName,
    requested,
    error: PackageResponseErrors.NotSupported,
    errorMessage: "Package registry not supported",
  };
  return error;
}

export function createNotFound(providerName: string, requested: PackageIdentifier): PackageResponse {
  const error: PackageResponse = {
    providerName,
    requested,
    error: PackageResponseErrors.NotFound,
    errorMessage: "Package not found",
  };
  return error;
}

// export function createInvalidVersion(name: string, version: string, type: string): PackageResponse {
//   const meta = {
//     type,
//     error: PackageErrors.InvalidVersion,
//     message: null,
//     tag: {
//       isInvalid: true,
//       isPrimaryTag: true
//     }
//   };
//   return createPackage(name, version, meta, null);
// }

// export function createGitFailed(name: string, message: string, type: string): PackageResponse {
//   const meta = {
//     type,
//     error: PackageErrors.GitNotFound,
//     message: `Could not find git repo: ${message}`,
//     tag: {
//       isPrimaryTag: true
//     }
//   };
//   return createPackage(name, message, meta, null);
// }

export function createUnexpected(
  providerName: string,
  requested: PackageIdentifier,
  response: HttpClientResponse
): PackageResponse {
  const error: PackageResponse = {
    providerName,
    requested,
    error: PackageResponseErrors.Unexpected,
    errorMessage: response.data,
    response
  };
  return error;
}