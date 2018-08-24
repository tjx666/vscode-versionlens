import { mavenGetPackageVersions } from './mavenAPI.js';
import appSettings from 'common/appSettings';
import * as PackageFactory from 'common/packageGeneration';
// import {
//   isOlderVersion,
//   filterTagsByName,
//   buildTagsFromVersionMap,
//   buildMapFromVersionList
// } from 'common/versionUtils';

const semver = require('semver');

export function mavenPackageParser(name, requestedVersion, appContrib) {
  // get all the versions for the package
  return mavenGetPackageVersions(name)
    .then(versions => {
      const packageInfo = {
            type: 'maven',
            message: 'teste'
          };
      return PackageFactory.createPackage(name, requestedVersion, packageInfo, null)
      // map from version list

      // versions.forEach(version => {
      //   versionMap
      // })
      // const versionMap = buildMapFromVersionList(
      //   versions,
      //   requestedVersion
      // );

      // // get all the tag entries
      // const extractedTags = buildTagsFromVersionMap(
      //   versionMap,
      //   nodeRequestedRange
      // );

      // grab the satisfiesEntry
      // const satisfiesEntry = extractedTags[0];

      // let filteredTags = extractedTags;
      // if (appSettings.showTaggedVersions === false) //  && extractedTags.length > 2
      //   // only show 'satisfies' and 'latest' entries when showTaggedVersions is false
      //   filteredTags = [
      //     satisfiesEntry,
      //     ...(satisfiesEntry.isLatestVersion ? [] : extractedTags[1])
      //   ];
      // else if (appContrib.mavenTagFilter.length > 0)
      //   // filter the tags using dotnet app config filter
      //   filteredTags = filterTagsByName(
      //     extractedTags,
      //     [
      //       // ensure we have a 'satisfies' entry
      //       'satisfies',
      //       // conditionally provide the latest entry
      //       ...(satisfiesEntry.isLatestVersion ? [] : 'latest'),
      //       // all other user tag name filters
      //       ...appContrib.mavenTagFilter
      //     ]
      //   );
        
      // map the tags to package dependencies
      // return versions.map((version) => {
      //   const packageInfo = {
      //     type: 'maven'
      //   };

      //   return PackageFactory.createPackage(
      //     name,
      //     version,
      //     packageInfo, 
      //     null
      //   );
      // });
      
    })
    .catch(error => {
      // show the 404 to the user; otherwise throw the error
      if (error.status === 404) {
        return PackageFactory.createPackageNotFound(
          name,
          requestedVersion,
          'maven'
        );
      }

      console.error(error);
      throw error;
    });

}