import appSettings from '../../../appSettings';
import * as ErrorFactory from 'core/errors/factory';
import * as ResponseFactory from 'core/packages/factories/packageResponseFactory';
import { mavenGetPackageVersions } from 'core/providers/maven/mavenAPI';
import { buildMapFromVersionList, buildTagsFromVersionMap } from 'core/providers/maven/versionUtils'

export function resolveMavenPackage(name, requestedVersion, appContrib) {

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
        return ResponseFactory.createNotFound(
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

          return ResponseFactory.createPackage(
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
        return ResponseFactory.createNotFound(
          name,
          requestedVersion,
          'maven'
        );
      }

      ErrorFactory.createConsoleError("Maven", "mavenGetPackageVersions", name, error);
      return ResponseFactory.createUnexpected(name, error);
    });

}
