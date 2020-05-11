/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as PackageLensFactory from '../../lenses/factories/packageLensFactory';
import { logErrorToConsole } from '../../../providers/shared/utils';
import { fetchPackage } from 'core/providers/dotnet/nugetClientApi.js';

export function resolveDotnetPackage(packagePath, name, requestedVersion) {

  // get all the versions for the package
  return fetchPackage(packagePath, name, requestedVersion)
    .then(pack => {
      // must be a registry version
      return PackageLensFactory.createPackageLens(pack, null);
    })
    .catch(error => {
      const { dotnetSpec, reason } = error;

      const requested = {
        name,
        version: requestedVersion
      }

      // show the 404 to the user; otherwise throw the error
      if (reason.status === 404) {
        return PackageLensFactory.createPackageNotFound('dotnet', requested);
      }

      logErrorToConsole('dotnet', 'resolveDotnetPackage', name, reason);
      return PackageLensFactory.createUnexpectedError(
        'dotnet',
        requested,
        reason
      );
    });
}