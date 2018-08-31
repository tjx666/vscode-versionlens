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

      let majors = []
      let latestMajor = null
      return versions.forEach(version => {
        
        if (latestMajor != version.split('.')[0]) {
          latestMajor = version.split('.')[0]
          majors.push(latestMajor)
        }
        let meta = {
          type: 'maven',
          tag: {
            name: 'satisfies',
            version: latestMajor,
            isPrimaryTag: true
          }
        }
        return PackageFactory.createPackage(
          name,
          requestedVersion,
          meta
        );

      });

      // const latestVersion = sorted.reverse()[0]

      // // const versionMap = {
      // //   releases: versions,
      // //   taggedVersions: []
      // // }

      // let meta = {
      //   type: 'maven',
      //   tag: {
      //     name: 'latest',
      //     version: latestVersion
      //   }
      // }

      // if (requestedVersion == latestVersion) {
      //   meta.tag = {
      //     isLatestVersion: true,
      //     isPrimaryTag: true,
      //     name: 'Latest',
      //     version: latestVersion
      //   }
      // }

      // return PackageFactory.createPackage(
      //   name,
      //   requestedVersion,
      //   meta
      // );

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
