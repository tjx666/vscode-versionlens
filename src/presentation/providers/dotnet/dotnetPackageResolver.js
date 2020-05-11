/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import appSettings from '../../../appSettings';
import { filterTagsByName, buildTagsFromVersionMap } from '../../../providers/shared/versionUtils';
import * as PackageLensFactory from '../../lenses/factories/packageLensFactory';
import { logErrorToConsole } from '../../../providers/shared/utils';
import { fetchPackage } from 'core/providers/dotnet/nugetClientApi.js';

export function resolveDotnetPackage(packagePath, name, requestedVersion) {

  // get all the versions for the package
  return fetchPackage(packagePath, name, requestedVersion)
    .then(pack => {

      // const replaceVersionFn: ReplaceVersionFunction =
      //   pack.source === PackageSourceTypes.git ?
      //     npmReplaceVersion :
      //     pack.type === PackageVersionTypes.alias ?
      //       customNpmAliasedGenerateVersion :
      //       null;

      // must be a registry version
      return PackageLensFactory.createPackageLens(pack, null);
    })
    .catch(error => {
      // show the 404 to the user; otherwise throw the error
      if (error.status === 404) {
        return PackageLensFactory.createPackageNotFound(
          name,
          requestedVersion,
          'nuget'
        );
      }

      logErrorToConsole("DotNet", "nugetGetPackageVersions", name, error);
      return PackageLensFactory.createUnexpectedError(name, error);
    });

}