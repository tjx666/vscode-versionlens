import {
  PackageNameVersion,
  PackageVersionTypes,
  PackageSourceTypes,
  PackageDocument,
  PackageSuggestion
} from '../models/packageDocument'

import * as SuggestFactory from '../factories/packageSuggestionFactory'

export function createNotFound(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.registry;

  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNotFound()
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    suggestions
  };
}

export function createInvalidVersion(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.registry;
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createInvalid(requested.version),
    SuggestFactory.createLatest(),
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    suggestions
  };
}

export function createNotSupported(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.registry;
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNotSupported(requested.version),
    SuggestFactory.createLatest(),
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    suggestions
  };
}

export function createGitFailed(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.git;
  const suggestions = [
    SuggestFactory.createNotFound(),
  ]

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    suggestions
  };
}

export function createNoMatch(provider: string, source: PackageSourceTypes, type: PackageVersionTypes, requested: PackageNameVersion, latestVersion?: string): PackageDocument {
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNoMatch(),
    SuggestFactory.createLatest(latestVersion),
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    suggestions
  };
}

export function createFourSegment(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.registry;
  const suggestions: Array<PackageSuggestion> = [];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    suggestions
  };
}