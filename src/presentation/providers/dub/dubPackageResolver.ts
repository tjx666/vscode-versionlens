import * as ErrorFactory from 'core/errors/factory';
import { fetchPackage } from 'core/providers/dub/dubApiClient';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { ReplaceVersionFunction, PackageLens } from 'presentation/lenses/models/packageLens';
import { FetchError } from 'core/clients/models/fetch';

export function resolveDubPackage(
  packagePath: string,
  packageName: string,
  packageVersion: string,
  replaceVersionFn: ReplaceVersionFunction): Promise<Array<PackageLens> | PackageLens> {

  const request = {
    packagePath,
    packageName,
    packageVersion
  };

  return fetchPackage(request)
    .then(pack => {
      return PackageLensFactory.createPackageLens(pack, null);
    })
    .catch(error => {
      const { request, response }: FetchError = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      }

      // show the 404 to the user; otherwise throw the error
      if (response.status === 404) {
        return PackageLensFactory.createPackageNotFound('dub', requested);
      }

      ErrorFactory.createConsoleError('dub', resolveDubPackage.name, requested.name, error);
      return PackageLensFactory.createUnexpectedError(
        'dub',
        requested,
        error
      );
    });
}