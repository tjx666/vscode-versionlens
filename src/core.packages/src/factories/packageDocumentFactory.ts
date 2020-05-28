import * as SuggestFactory from '../factories/packageSuggestionFactory'
import {
  PackageVersionTypes,
  PackageSourceTypes,
  PackageDocument,
  PackageSuggestion,
} from '../definitions/packageDocument'
import { PackageIdentifier } from '../definitions/packageRequest';
import { PackageResponseStatus } from '../definitions/packageResponse';

export function createNotFound(
  providerName: string,
  requested: PackageIdentifier,
  type: PackageVersionTypes,
  response: PackageResponseStatus
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNotFound()
  ];

  return {
    providerName,
    source,
    type,
    requested,
    resolved: null,
    suggestions,
    response
  };
}

export function createForbidden(
  providerName: string,
  requested: PackageIdentifier,
  type: PackageVersionTypes,
  response: PackageResponseStatus
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createForbidden()
  ];

  return {
    providerName,
    source,
    type,
    requested,
    resolved: null,
    suggestions,
    response
  };
}

export function createConnectionRefused(
  providerName: string,
  requested: PackageIdentifier,
  type: PackageVersionTypes,
  response: PackageResponseStatus
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createConnectionRefused()
  ];

  return {
    providerName,
    source,
    type,
    requested,
    resolved: null,
    suggestions,
    response
  };
}

export function createNotAuthorized(
  providerName: string,
  requested: PackageIdentifier,
  type: PackageVersionTypes,
  response: PackageResponseStatus
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNotAuthorized()
  ];

  return {
    providerName,
    source,
    type,
    requested,
    resolved: null,
    suggestions,
    response
  };
}

export function createInvalidVersion(
  providerName: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createInvalid(''),
    SuggestFactory.createLatest(),
  ];

  return {
    providerName,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createNotSupported(
  providerName: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNotSupported(),
  ];

  return {
    providerName,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createGitFailed(
  providerName: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Git;
  const suggestions = [
    SuggestFactory.createNotFound(),
  ]

  return {
    providerName,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createNoMatch(
  providerName: string,
  source: PackageSourceTypes,
  type: PackageVersionTypes,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  latestVersion?: string
): PackageDocument {

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNoMatch(),
    SuggestFactory.createLatest(latestVersion),
  ];

  return {
    providerName,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createFourSegment(
  providerName: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;
  const suggestions: Array<PackageSuggestion> = [];

  return {
    providerName,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}


export function createFixed(
  providerName: string,
  source: PackageSourceTypes,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes,
  fixedVersion: string
): PackageDocument {

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createFixedStatus(fixedVersion)
  ];

  return {
    providerName,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}