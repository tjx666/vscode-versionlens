/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as semver from 'semver';
import appSettings from '../../common/appSettings';
import { nugetGetPackageVersions } from './nugetAPI.js';
import { mapTaggedVersions, tagFilter, isFixedVersion, isOlderVersion } from '../../common/versions';
import { generateNotFoundPackage } from '../../common/packageGeneration';

export function dotnetVersionParser(node, appConfig) {
  const { name, value: requestedVersion } = node;

  // check if its a valid semver, if not could be a tag like latest
  const isValidSemver = semver.validRange(requestedVersion);

  // check if this is a fixed version
  const isFixed = isValidSemver && isFixedVersion(requestedVersion);

  // get all the versions for the package
  return nugetGetPackageVersions(name)
    .then(versions => {
      // get all the tag entries
      let tags = mapTaggedVersions(versions, requestedVersion);

      // only show matches and latest entries when showTaggedVersions is false
      // otherwise filter by the appConfig.dotnetTagFilter
      let tagsToProcess;
      if (appSettings.showTaggedVersions === false)
        tagsToProcess = [
          tags[0], // matches entry
          tags[1]  // latest entry
        ];
      else if (appConfig.dotnetTagFilter.length > 0)
        tagsToProcess = tagFilter(tags, [
          'Matches',
          'Latest',
          ...appConfig.dotnetTagFilter
        ]);
      else
        tagsToProcess = tags;

      // map the tags to packages
      return tagsToProcess.map((tag, index) => {
        const isTaggedVersion = index !== 0;
        const isOlder = tag.version && isValidSemver && isOlderVersion(tag.version, requestedVersion);

        const packageInfo = {
          type: 'nuget',
          isValidSemver,
          isFixedVersion: isFixed,
          tag,
          isTaggedVersion,
          isOlderVersion: isOlder
        };

        return {
          node,
          package: {
            name,
            version: requestedVersion,
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
          package: generateNotFoundPackage(name, version, 'nuget')
        }];

      console.error(error);
      throw error;
    });



}