// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { ILogger } from 'core/logging/definitions';
import { PackageDependencyLens } from 'core/packages/models/PackageDependencyLens';
import { PackageResponseAggregate, ReplaceVersionFunction } from 'core/packages/models/packageResponse';
import { VersionLens } from 'presentation/lenses/models/versionLens';
import { VersionLensFetchResponse } from '../../providers/abstract/abstractVersionLensProvider';
import { PackageRequest, PackageRequestFunction } from "core/packages/models/packageRequest";
import * as RequestFactory from 'core/packages/factories/packageRequestFactory';

export async function createVersionLenses(
  document: VsCodeTypes.TextDocument,
  dependencies: Array<PackageDependencyLens>,
  logger: ILogger,
  packageFetchRequest: PackageRequestFunction,
  versionReplace: ReplaceVersionFunction,
): VersionLensFetchResponse {

  const results = [];

  const { dirname } = require('path');
  const packagePath = dirname(document.uri.fsPath);

  const promises = dependencies.map(
    function (dependency) {
      const promisedDependency = resolveDependency(
        dependency,
        document,
        packagePath,
        logger,
        packageFetchRequest,
        versionReplace,
      );
      return promisedDependency.then(function (lenses) {
        results.push(...lenses)
      });
    }
  );

  return Promise.all(promises).then(_ => results)
}

function resolveDependency(
  dependency: PackageDependencyLens,
  document: VsCodeTypes.TextDocument,
  packagePath: string,
  logger: ILogger,
  packageFetchRequest: PackageRequestFunction,
  versionReplace: ReplaceVersionFunction,
): Promise<Array<VersionLens>> {

  const { name, version } = dependency.packageInfo;

  const request: PackageRequest = {
    package: {
      name,
      version,
      path: packagePath,
    },
    logger
  };

  return RequestFactory.createPackageRequest(
    request,
    packageFetchRequest,
    versionReplace
  )
    .then(function (responses): Array<VersionLens> {

      if (Array.isArray(responses)) {
        // multiple lens for a package (versions, tags etc...)
        return responses.map(
          function (response, order) {
            return createVersionlensFromEntry(
              {
                order,
                dependency,
                response
              },
              document
            );
          }
        );
      }

      // single lens for a package (errors etc...)
      return [
        createVersionlensFromEntry(
          {
            order: 0,
            dependency,
            response: responses
          },
          document
        )
      ];
    });
}

function createVersionlensFromEntry(entry: PackageResponseAggregate, document: VsCodeTypes.TextDocument): VersionLens {
  const { Uri, Range } = require('vscode')

  const { nameRange, versionRange } = entry.dependency;
  const commandRangePos = nameRange.start + entry.order;
  const commandRange = new Range(
    document.positionAt(commandRangePos),
    document.positionAt(commandRangePos)
  );
  const replaceRange = new Range(
    document.positionAt(versionRange.start),
    document.positionAt(versionRange.end)
  );
  return new VersionLens(
    commandRange,
    replaceRange,
    entry.response,
    Uri.file(document.fileName)
  );
}