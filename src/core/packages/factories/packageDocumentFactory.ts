import * as SuggestFactory from '../factories/packageSuggestionFactory'
import {
  PackageVersionTypes,
  PackageSourceTypes,
  PackageDocument,
  PackageSuggestion,
} from '../models/packageDocument'
import { PackageIdentifier } from '../models/packageRequest';
import { PackageResponseStatus } from '../models/packageResponse';

export function createNotFound(
  provider: string,
  requested: PackageIdentifier,
  type: PackageVersionTypes,
  response: PackageResponseStatus
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNotFound()
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    suggestions,
    response
  };
}

export function createInvalidVersion(
  provider: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createInvalid(requested.version),
    SuggestFactory.createLatest(),
  ];

  return {
    provider,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createNotSupported(
  provider: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNotSupported(),
    SuggestFactory.createLatest(),
  ];

  return {
    provider,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createGitFailed(
  provider: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Git;
  const suggestions = [
    SuggestFactory.createNotFound(),
  ]

  return {
    provider,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createNoMatch(
  provider: string,
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
    provider,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}

export function createFourSegment(
  provider: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  type: PackageVersionTypes
): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.Registry;
  const suggestions: Array<PackageSuggestion> = [];

  return {
    provider,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}


export function createFixed(
  provider: string,
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
    provider,
    source,
    type,
    requested,
    response,
    resolved: null,
    suggestions
  };
}