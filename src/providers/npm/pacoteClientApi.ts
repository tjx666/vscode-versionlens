import {
  PackageDocument,
  PackageVersionTypes,
  PackageSourceTypes,
  PackageNameVersion
} from '../core/models/packageDocument';

export async function fetchPackage(packagePath, packageName, packageVersion): Promise<PackageDocument> {
  const npa = require('npm-package-arg');
  let npaResult;

  try {
    npaResult = npa.resolve(packageName, packageVersion, packagePath);
  } catch (reason) {
    return Promise.reject({ npaResult, reason });
  }

  if (npaResult.type === 'directory' || npaResult.type === 'file')
    return createDirectoryPackageDocument(packageName, packageVersion, npaResult);

  return createRemotePackageDocument(packagePath, packageName, packageVersion, npaResult);
}

function createRemotePackageDocument(where: string, rawName: string, rawVersion: string, npaResult: any): Promise<PackageDocument> {
  const pacote = require('pacote');
  const npmConfig = require('libnpmconfig');

  // get npm config
    const npmOpts = npmConfig.read(
    {
      where,
      fullMetadata: false,
      // 'prefer-online': true,
    },
    {
      cwd: where,
    }
  );

  return pacote.packument(npaResult, npmOpts)
    .then(function (packu): PackageDocument {
      const semver = require("semver");

      const given = {
        name: rawName,
        version: rawVersion
      };

      const resolved = {
        name: npaResult.name,
        version: npaResult.rawSpec,
      };

      const sortedVersions = Object.keys(packu.versions || {}).sort(semver.compareLoose);

      const distTags = packu['dist-tags'];

      const tags = Object.keys(distTags)
        .map(function (key): PackageNameVersion {
          return {
            name: key,
            version: distTags[key]
          };
        });

      let source: PackageSourceTypes;
      let type: PackageVersionTypes;
      let gitSpec: any;
      let versions: Array<string> = [];

      if (npaResult.type === "git") {
        source = PackageSourceTypes.git;
        gitSpec = npaResult.hosted;

        if (npaResult.gitRange) {
          type = PackageVersionTypes.range;
          versions = filterVersionsWithinRange(npaResult.gitRange, sortedVersions);
        } else if (npaResult.gitCommittish) {
          type = PackageVersionTypes.committish;
          versions = filterVersionsWithinRange(npaResult.gitCommittish, sortedVersions);
        } else {
          versions = filterVersionsWithinRange(npaResult.rawSpec, sortedVersions);
        }

      } else if (npaResult.type === "alias") {
        source = PackageSourceTypes.registry;
        type = npaResult.type;
        resolved.name = npaResult.subSpec.name;
        resolved.version = npaResult.subSpec.rawSpec;
        versions = filterVersionsWithinRange(npaResult.subSpec.rawSpec, sortedVersions);
      } else {
        source = PackageSourceTypes.registry;
        type = npaResult.type;
        resolved.version = npaResult.rawSpec;
        versions = filterVersionsWithinRange(npaResult.rawSpec, sortedVersions);
      }

      const latest = distTags['latest'];
      if (versions.length === 0 && latest) versions.push(latest);

      return {
        provider: 'npm',
        source,
        type,
        given,
        resolved,
        gitSpec,
        // satisfying versions
        versions,
        // tagged versions
        tags,
      };
    })
    .catch(reason => Promise.reject({ reason, npaResult }));
}

function createDirectoryPackageDocument(rawName: string, rawVersion: string, npaResult: any): PackageDocument {
  const source = PackageSourceTypes.directory;
  const type = PackageVersionTypes.version;

  const given = {
    name: rawName,
    version: rawVersion,
  };

  const resolved = {
    name: npaResult.name,
    version: npaResult.version,
  };

  return {
    provider: 'npm',
    source,
    type,
    given,
    resolved,
  };
}

function filterVersionsWithinRange(range: string, versions: Array<string>): Array<string> {
  const semver = require("semver");
  // make sure we have a valid version or range
  if (semver.valid(range) === null && semver.validRange(range) === null) return versions;
  return versions.filter(function (version: string) {
    return semver.satisfies(version, range)
  });
}
