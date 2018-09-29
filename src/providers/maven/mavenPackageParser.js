import { mavenGetPackageVersions } from './mavenAPI';
import appSettings from 'common/appSettings';
import * as PackageFactory from 'common/packageGeneration';
import { buildMapFromVersionList, buildTagsFromVersionMap } from './versionUtils'

export function mavenPackageParser(name, requestedVersion, appContrib) {

  // get all the versions for the package
  return mavenGetPackageVersions(name)
    .then((versions) => {
      // console.log(versions);

      let versionMeta = buildMapFromVersionList(versions, requestedVersion)

      let extractedTags = buildTagsFromVersionMap(versionMeta, requestedVersion)

      let filteredTags = extractedTags;
      if (appSettings.showTaggedVersions === false) {
        filteredTags = extractedTags.filter(tag => {
          if (tag.name && /alpha|beta|rc|milestone|snapshot|sp/.test(tag.name)) {
            return false
          }
          return true
        })
      }

      if (versionMeta.allVersions.length === 0) {
        return PackageFactory.createPackageNotFound(
          name,
          requestedVersion,
          'maven'
        );
      }
      return filteredTags
        .map((tag, index) => {
          // generate the package data for each tag
          const meta = {
            type: 'maven',
            tag
          };

          return PackageFactory.createPackage(
            name,
            requestedVersion,
            meta,
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
          'maven'
        );
      }

      console.error(error);
      throw error;
    });

}
