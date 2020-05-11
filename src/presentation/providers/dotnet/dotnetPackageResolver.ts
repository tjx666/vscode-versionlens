import * as ErrorFactory from 'core/errors/factory';
import { fetchPackage } from 'core/providers/dotnet/nugetClientApi.js';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { ReplaceVersionFunction, PackageLens } from 'presentation/lenses/models/packageLens';

export function resolveDotnetPackage(
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
      // must be a registry version
      return PackageLensFactory.createPackageLens(pack, replaceVersionFn);
    })
    .catch(error => {
      const { request } = error;

      const requested = {
        name: request.packageName,
        version: request.packageVersion
      }

      ErrorFactory.createConsoleError('dotnet', resolveDotnetPackage.name, requested.name, error);
      return PackageLensFactory.createUnexpectedError(
        'dotnet',
        requested,
        error
      );
    });
}