import { TextDocument } from 'vscode';

import { PackageResponse, TReplaceVersionFunction } from 'core.packages';

import { VersionLens } from './versionLens';

export function createFromPackageResponses(
  document: TextDocument,
  responses: Array<PackageResponse>,
  replaceVersionFn: TReplaceVersionFunction,
): Array<VersionLens> {
  return responses.map(
    function (response) {
      return createFromPackageResponse(
        response,
        document,
        replaceVersionFn
      );
    }
  );
}

function createFromPackageResponse(
  packageResponse: PackageResponse,
  document: TextDocument,
  replaceVersionFn: TReplaceVersionFunction,
): VersionLens {
  const { Uri, Range } = require('vscode')

  const { nameRange, versionRange } = packageResponse;
  const commandRangePos = nameRange.start + packageResponse.order;
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
    packageResponse,
    Uri.file(document.fileName),
    replaceVersionFn.bind(document.getText())
  );
}