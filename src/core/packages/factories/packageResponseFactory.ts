import { HttpResponse, HttpResponseSources } from "core/clients";
import { PackageDocument } from "../models/packageDocument";
import {
  PackageResponse,
  PackageResponseErrors,
  ReplaceVersionFunction,
  PackageResponseStatus
} from "../models/packageResponse";
import { PackageIdentifier } from "../models/packageRequest";

export function createSuccess(document: PackageDocument, replaceVersionFn: ReplaceVersionFunction): Array<PackageResponse> {
  // map the documents to responses
  return document.suggestions.map(function (suggestion, index): PackageResponse {
    const response: PackageResponse = {
      provider: document.provider,
      source: document.source,
      type: document.type,
      requested: document.requested,
      resolved: document.resolved,
      suggestion,
      replaceVersionFn
    };

    return response;
  })
}

export function createResponseStatus(source: HttpResponseSources, status: number): PackageResponseStatus {
  return {
    source,
    status
  };
}

export function createNotSupported(provider: string, requested: PackageIdentifier): PackageResponse {
  const error: PackageResponse = {
    provider,
    requested,
    error: PackageResponseErrors.NotSupported,
    errorMessage: "Package registry not supported",
  };
  return error;
}

export function createNotFound(provider: string, requested: PackageIdentifier): PackageResponse {
  const error: PackageResponse = {
    provider,
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

export function createUnexpected(provider: string, requested: PackageIdentifier, response: HttpResponse): PackageResponse {
  const error: PackageResponse = {
    provider,
    requested,
    error: PackageResponseErrors.Unexpected,
    errorMessage: response.responseText,
    response
  };
  return error;
}


// export function createPackage(source: string, resolved: PackageNameVersion, requested: PackageNameVersion, replaceVersionFn?: ReplaceVersionFunction): PackageResponse {
//   return {
//     name,
//     version,
//     meta,
//     replaceVersionFn
//   };
// }