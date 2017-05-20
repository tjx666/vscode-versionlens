/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from '../../common/appSettings';
import { nugetGetPackageVersions, convertNugetToNodeRange } from './nugetAPI.js';
import {
  isOlderVersion,
  filterTagsByName,
  buildTagsFromVersionMap,
  buildMapFromVersionList
} from '../../common/versionUtils';
import * as PackageFactory from '../../common/packageGeneration';

const semver = require('semver');

export function dotnetVersionParser(node, appConfig) {
  const { name, value: requestedVersion } = node;

  // convert a nuget range to node semver range
  const nodeRequestedRange = requestedVersion && convertNugetToNodeRange(requestedVersion)

  // get all the versions for the package
  return nugetGetPackageVersions(name)
    .then(versions => {
      // map from version list
      const versionMap = buildMapFromVersionList(
        versions,
        nodeRequestedRange
      );

      // get all the tag entries
      const extractedTags = buildTagsFromVersionMap(
        versionMap,
        nodeRequestedRange
      );

      // grab the satisfiesEntry
      const satisfiesEntry = extractedTags[0];

      let filteredTags = extractedTags;
      if (appSettings.showTaggedVersions === false) //  && extractedTags.length > 2
        // only show 'satisfies' and 'latest' entries when showTaggedVersions is false
        filteredTags = [
          satisfiesEntry,
          ...(satisfiesEntry.isLatestVersion ? [] : extractedTags[1])
        ];
      else if (appConfig.dotnetTagFilter.length > 0)
        // filter the tags using dotnet app config filter
        filteredTags = filterTagsByName(
          extractedTags,
          [
            // ensure we have a 'satisfies' entry
            'satisfies',
            // conditionally provide the latest entry
            ...(satisfiesEntry.isLatestVersion ? [] : 'latest'),
            // all other user tag name filters
            appConfig.dotnetTagFilter
          ]
        );

      // map the tags to package dependencies
      return filteredTags.map((tag, index) => {
        const packageInfo = {
          type: 'nuget',
          tag
        };

        return {
          node,
          package: PackageFactory.createPackage(
            name,
            requestedVersion, // TODO need nodeRequestedRange to be shown in match not found info
            packageInfo
          )
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