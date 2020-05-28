import {
  DocumentFactory,
  PackageIdentifier,
  PackageResponseStatus,
  PackageDocument,
  PackageVersionTypes,
  PackageSourceTypes,
  PackageSuggestion,
  PackageSuggestionFlags
} from 'core.packages';

import { NpaSpec } from '../models/npaSpec';

export const fileDependencyRegex = /^file:(.*)$/;

export function createDirectory(
  providerName: string,
  requested: PackageIdentifier,
  response: PackageResponseStatus,
  npaSpec: NpaSpec
): PackageDocument {

  const fileRegExpResult = fileDependencyRegex.exec(requested.version);
  if (!fileRegExpResult) {
    return DocumentFactory.createInvalidVersion(
      providerName,
      requested,
      response,
      <any>npaSpec.type // todo create a converter
    );
  }

  const source = PackageSourceTypes.Directory;
  const type = PackageVersionTypes.Version;

  const resolved = {
    name: npaSpec.name,
    version: fileRegExpResult[1],
  };

  const suggestions: Array<PackageSuggestion> = [
    {
      name: 'file://',
      version: resolved.version,
      flags: PackageSuggestionFlags.release
    },
  ]

  return {
    providerName,
    source,
    type,
    requested,
    response,
    resolved,
    suggestions
  };
}