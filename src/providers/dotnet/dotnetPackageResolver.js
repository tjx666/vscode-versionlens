/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from '../../appSettings';
import { filterTagsByName, buildTagsFromVersionMap, buildMapFromVersionList } from '../shared/versionUtils';
import * as PackageFactory from '../shared/packageFactory';
import { logErrorToConsole } from '../shared/utils';
import { nugetGetPackageVersions } from './nugetClient.js';
import { parseVersionSpec, convertVersionSpecToString } from './dotnetUtils.js';

export function resolveDotnetPackage(name, requestedVersion, appContrib) {
  // parse the version
  const versionSpec = parseVersionSpec(requestedVersion);
  if (versionSpec && versionSpec.hasFourSegments) return null;

  // convert spec to string
  const nodeRequestedRange = versionSpec && convertVersionSpecToString(versionSpec)

  // get all the versions for the package
  return nugetGetPackageVersions(name)
    .then(versions => {
      // map from version list
      const versionMap = buildMapFromVersionList(versions, nodeRequestedRange);

      // get all the tag entries
      const extractedTags = buildTagsFromVersionMap(versionMap, nodeRequestedRange);

      // grab the satisfiesEntry
      const satisfiesEntry = extractedTags[0];

      let filteredTags = extractedTags;
      if (appSettings.showTaggedVersions === false) //  && extractedTags.length > 2
        // only show 'satisfies' and 'latest' entries when showTaggedVersions is false
        filteredTags = [
          satisfiesEntry,
          ...(satisfiesEntry.isLatestVersion ? [] : [extractedTags[1]])
        ];
      else if (appContrib.dotnetTagFilter.length > 0)
        // filter the tags using dotnet app config filter
        filteredTags = filterTagsByName(
          extractedTags,
          [
            // ensure we have a 'satisfies' entry
            'satisfies',
            // conditionally provide the latest entry
            ...(satisfiesEntry.isLatestVersion ? [] : ['latest']),
            // all other user tag name filters
            ...appContrib.dotnetTagFilter
          ]
        );

      // map the tags to package dependencies
      return filteredTags.map(tag => {
        const packageInfo = {
          type: 'nuget',
          tag
        };

        return PackageFactory.createPackage(
          name,
          nodeRequestedRange,
          packageInfo,
          null
        );
      });

    })
    .catch(error => {
      // show the 404 to the user; otherwise throw the error
      if (error.status === 404) {
        return PackageFactory.createPackageNotFound(
          name,
          requestedVersion,
          'nuget'
        );
      }

      logErrorToConsole("DotNet", "nugetGetPackageVersions", name, error);
      return PackageFactory.createUnexpectedError(name, error);
    });

}