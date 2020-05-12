// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { PackageDependencyLens } from "core/packages/models/PackageDependencyLens";
import { PackageResolverFunction, PackageResponseAggregate, } from "../../../core/packages/models/packageResponse";
import { VersionLens } from "presentation/lenses/models/versionLens";

export async function createVersionLenses(
  packagePath: string,
  document: VsCodeTypes.TextDocument,
  dependencies: Array<PackageDependencyLens>,
  packageFetchRequest: PackageResolverFunction): Promise<VersionLens[]> {

  const results = [];

  const promises = dependencies.map((dependency, index) => {
    return resolveDependency(
      packageFetchRequest,
      packagePath,
      dependency,
      document,
      index
    ).then(function (lenses) {
      results.push(...lenses)
    })
  });

  return Promise.all(promises).then(_ => results)
}

function resolveDependency(
  packageFetchRequest: PackageResolverFunction,
  packagePath: string,
  dependency: PackageDependencyLens,
  document: VsCodeTypes.TextDocument,
  order: number
): Promise<Array<VersionLens>> {

  const { name: packageName, version: packageVersion } = dependency.packageInfo;
  const request = { packagePath, packageName, packageVersion };

  // returns VersionLens | Array<VersionLens>
  return packageFetchRequest(request, null)
    .then(function (responses): Array<VersionLens> {

      if (Array.isArray(responses)) {
        // multiple lens for a package (versions, tags etc...)
        return responses.map(
          function (response) {
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
            order,
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