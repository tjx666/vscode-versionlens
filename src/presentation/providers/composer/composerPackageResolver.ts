import * as ErrorFactory from 'core/errors/factory';
import { fetchPackage } from 'core/providers/composer/composerClientApi';
import * as PackageLensFactory from 'presentation/lenses/factories/packageLensFactory';
import { PackageLens, ReplaceVersionFunction } from 'presentation/lenses/models/packageLens';

export function resolveComposerPackage(
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
    .then(pack => PackageLensFactory.createPackageLens(pack, null))
    .catch(error => {
      const { request, response } = error;

      const requested = {
        name: packageName,
        version: packageVersion
      };

      if (response.status === 404) {
        return PackageLensFactory.createPackageNotFound('composer', requested);
      }

      ErrorFactory.createConsoleError('composer', resolveComposerPackage.name, packageName, error);
      return PackageLensFactory.createUnexpectedError(
        'composer',
        requested,
        error
      );
    });
}