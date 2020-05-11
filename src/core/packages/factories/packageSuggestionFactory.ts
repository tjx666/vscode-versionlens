import { PackageVersionStatus, PackageSuggestionFlags, PackageSuggestion } from "../models/packageDocument";

export function createNotFound(requestedVersion: string): PackageSuggestion {
  return {
    name: PackageVersionStatus.notfound,
    version: requestedVersion,
    flags: PackageSuggestionFlags.status
  };
}

export function createInvalid(requestedVersion: string): PackageSuggestion {
  return {
    name: PackageVersionStatus.invalid,
    version: requestedVersion,
    flags: PackageSuggestionFlags.status
  };
}

export function createNotSupported(requestedVersion: string): PackageSuggestion {
  return {
    name: PackageVersionStatus.notsupported,
    version: requestedVersion,
    flags: PackageSuggestionFlags.status
  };
}

export function createNoMatch(): PackageSuggestion {
  return {
    name: PackageVersionStatus.nomatch,
    version: '',
    flags: PackageSuggestionFlags.status
  };
}

export function createLatest(requestedVersion?: string): PackageSuggestion {
  // when there is no requestedVersion then use the 'latest' tag
  // otherwise its a release version
  return {
    name: PackageVersionStatus.latest,
    version: requestedVersion || 'latest',
    flags: requestedVersion ? PackageSuggestionFlags.release : PackageSuggestionFlags.tag
  };
}

export function createSuggestion(name: string, version: string, flags: PackageSuggestionFlags): PackageSuggestion {
  return { name, version, flags };
}