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
    SuggestFactory.createNotFound(requested.version),
    SuggestFactory.createLatest(),
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    tags: suggestions
  };
}

export function createInvalidVersion(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.registry;
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createInvalid(requested.version),
    SuggestFactory.createLatest(),
  ];

  return {
    provider: 'npm',
    source,
    type,
    requested,
    resolved: null,
    tags: suggestions
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
    tags: suggestions
  };
}

export function createGitFailed(provider: string, requested: PackageNameVersion, type: PackageVersionTypes): PackageDocument {
  const source: PackageSourceTypes = PackageSourceTypes.git;
  const suggestions = [
    SuggestFactory.createNotFound(requested.version),
    SuggestFactory.createLatest(),
  ]

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    tags: suggestions
  };
}

export function createNoMatch(provider: string, source: PackageSourceTypes, type: PackageVersionTypes, requested: PackageNameVersion, ): PackageDocument {
  const suggestions: Array<PackageSuggestion> = [
    SuggestFactory.createNoMatch(),
    SuggestFactory.createLatest(),
  ];

  return {
    provider,
    source,
    type,
    requested,
    resolved: null,
    tags: suggestions
  };
}