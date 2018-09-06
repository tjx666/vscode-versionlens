import { mavenGetPackageVersions } from './mavenAPI.js';
import appSettings from 'common/appSettings';
import * as PackageFactory from 'common/packageGeneration';
import { buildMapFromVersionList } from 'providers/maven/versionUtils'

export function mavenPackageParser(name, requestedVersion, appContrib) {

  // get all the versions for the package
  return mavenGetPackageVersions(name)
    .then(versions => {
      console.log(versions);
      let customWrapVersion = (v) => {
        return `${v}`
      }

      let versionMeta = buildMapFromVersionList(versions, requestedVersion)

      return versionMeta.map((meta, index) => {
        return PackageFactory.createPackage(
          name,
          meta.tag.version,
          meta,
          null,
          customWrapVersion
        );
      })

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
