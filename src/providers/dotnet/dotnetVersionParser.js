/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import appSettings from '../../common/appSettings';
import { nugetGetPackageVersions, convertNugetToNodeRange } from './nugetAPI.js';
import { extractTagsFromVersionList, tagFilter, isOlderVersion } from '../../common/versions';
import * as PackageFactory from '../../common/packageGeneration';

export function dotnetVersionParser(node, appConfig) {
  const { name, value: requestedVersion } = node;

  // convert a nuget range to node semver range
  const nodeRequestedRange = requestedVersion && convertNugetToNodeRange(requestedVersion)

  // get all the versions for the package
  return nugetGetPackageVersions(name)
    .then(versions => {
      // get all the tag entries
      let extractedTags = extractTagsFromVersionList(versions, nodeRequestedRange);

      const satisfiesEntry = extractedTags[0];

      // only show matches and latest entries when showTaggedVersions is false
      // otherwise filter by the appConfig.dotnetTagFilter
      let tagsToProcess;
      if (appSettings.showTaggedVersions === false)
        tagsToProcess = [
          satisfiesEntry,
          ...(satisfiesEntry.isLatestVersion ? [] : extractedTags[1])
        ];
      else if (appConfig.dotnetTagFilter.length > 0)
        tagsToProcess = tagFilter(extractedTags, [
          'satisfies',
          ...(installsLatest ? [] : 'latest'),
          ...appConfig.dotnetTagFilter
        ]);
      else
        tagsToProcess = extractedTags;

      // map the tags to packages
      return tagsToProcess.map((tag, index) => {
        const isTaggedVersion = index !== 0;
        const isOlder = tag.version && !tag.isInvalid && nodeRequestedRange && isOlderVersion(tag.version, nodeRequestedRange);

        const packageInfo = {
          type: 'nuget',
          tag,
          isTaggedVersion,
          isOlderVersion: isOlder
        };

        return {
          node,
          package: {
            name,
            version: nodeRequestedRange || requestedVersion,
            meta: packageInfo
          }
        };

      });

    })
    .catch(error => {
      // show the 404 to the user; otherwise throw the error
      if (error.status === 404)
        return [{
          node,
          package: PackageFactory.createPackageNotFound(name, version, 'nuget')
        }];

      console.error(error);
      throw error;
    });

}