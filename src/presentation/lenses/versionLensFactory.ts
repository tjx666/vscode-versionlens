// vscode references
import * as VsCodeTypes from 'vscode';

// imports
import { PackageResponse } from 'core/packages';
import { VersionLens } from './versionLens';

export function createVersionLensesFromResponses(
  document: VsCodeTypes.TextDocument, responses: Array<PackageResponse>
): Array<VersionLens> {
  // multiple lens for a package (versions, tags etc...)
  return responses.map(
    function (response) {
      return createVersionlensFromEntry(
        response,
        document
      );
    }
  );
}

function createVersionlensFromEntry(
  response: PackageResponse, document: VsCodeTypes.TextDocument
): VersionLens {
  const { Uri, Range } = require('vscode')

  const { nameRange, versionRange } = response;
  const commandRangePos = nameRange.start + response.order;
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
    response,
    Uri.file(document.fileName)
  );
}