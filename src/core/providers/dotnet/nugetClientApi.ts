/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageDocument, PackageSourceTypes, } from '../../packages/models/packageDocument';

import {
  splitReleasesFromArray,
  removeFourSegmentVersionsFromArray,
  createVersionTags
} from '../../packages/helpers/versionHelpers';

import { parseVersionSpec } from './dotnetUtils.js';
import { DotNetVersionSpec } from './models/versionSpec';

export async function fetchPackage(packagePath, packageName, packageVersion): Promise<PackageDocument> {
  const dotnetSpec = parseVersionSpec(packageVersion);

  // const nugetFeeds = 
  // const queryUrl = `${feed}?id=${packageName}&prerelease=${appContrib.dotnetIncludePrerelease}&semVerLevel=2.0.0`;
  // const nugetResult = resolveNuget()

  return createRemotePackageDocument(packagePath, packageName, packageVersion, dotnetSpec);
}

function createRemotePackageDocument(packagePath: string, rawName: string, rawVersion: string, dotnetSpec: DotNetVersionSpec): Promise<PackageDocument> {
  const url = `https://azuresearch-usnc.nuget.org/autocomplete?id=${rawName}&prerelease=true&semVerLevel=2.0.0`;

  const httpRequest = require('request-light')
  return httpRequest.xhr({ url })
    .then(response => {
      if (response.status != 200) {
        return Promise.reject({
          status: response.status,
          responseText: response.responseText
        });
      }

      const packu = JSON.parse(response.responseText);
      if (packu.totalHits === 0) return Promise.reject({ status: 404 });

      const versionRange = dotnetSpec.resolvedVersion;

      const requested = {
        name: rawName,
        version: rawVersion
      };

      const resolved = {
        name: rawName,
        version: versionRange,
      };

      // sanitize to semver only versions
      const rawVersions = removeFourSegmentVersionsFromArray(packu.data);

      // seperate versions to releases and prereleases
      const { releases, prereleases } = splitReleasesFromArray(rawVersions)

      // anaylse and report
      const tags = createVersionTags(versionRange, releases, prereleases);

      return {
        provider: 'dotnet',
        source: PackageSourceTypes.registry,
        type: dotnetSpec.type,
        requested,
        resolved,
        releases,
        prereleases,
        tags,
      };
    })
    .catch(reason => Promise.reject({ reason, dotnetSpec }));

}