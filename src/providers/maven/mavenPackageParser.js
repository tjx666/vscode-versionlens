import { mavenGetPackageVersions } from './mavenAPI.js';
import appSettings from 'common/appSettings';
import * as PackageFactory from 'common/packageGeneration';
import { getNodeMajorVersion } from 'typescript';

const compareVersions = require('tiny-version-compare');

export function mavenPackageParser(name, requestedVersion, appContrib) {

  // get all the versions for the package
  return mavenGetPackageVersions(name)
    .then(versions => {

      let sorted = versions.sort(compareVersions)

      let latestMajor = null
      let latestVersions = []
      
      for (const v of sorted.reverse()) {
        let major = v.split('.')[0]
        if (latestMajor != major) {
          latestMajor = major
          latestVersions.push(v)
        } 
      }

      return latestVersions.map((version, index) => {

        let meta = {
          type: 'maven',
          tag: {
            name: 'major',
            version: version
          }
        }

        return PackageFactory.createPackage(
          name,
          requestedVersion,
          meta
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
