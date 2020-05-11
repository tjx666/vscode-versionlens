import * as PackageLensFactory from '../../lenses/factories/packageLensFactory';
import { logErrorToConsole } from '../../../providers/shared/utils';
import { fetchPackage } from '../../../core/providers/dub/dubClientApi';

export function resolveDubPackage(packagePath, name, requestedVersion) {

  // get all the versions for the package
  return fetchPackage(packagePath, name, requestedVersion)
    .then(pack => {
      // must be a registry version
      return PackageLensFactory.createPackageLens(pack, null);
    })
    .catch(error => {
      const { dubSpec, reason } = error;

      const requested = {
        name,
        version: requestedVersion
      }

      // show the 404 to the user; otherwise throw the error
      if (reason.status === 404) {
        return PackageLensFactory.createPackageNotFound('dub', requested);
      }

      logErrorToConsole('dub', 'resolveDubPackage', name, reason);
      return PackageLensFactory.createUnexpectedError(
        'dub',
        requested,
        reason
      );
    });
}