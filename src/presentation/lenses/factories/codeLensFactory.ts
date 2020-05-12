// vscode references
import { TextDocument } from 'vscode';

// imports
import { VersionLens } from 'presentation/lenses/models/versionLens';
import { PackageResponseAggregate } from 'core/packages/models/packageResponse';

const { Range, Uri } = require('vscode');

export async function createCodeLenses(aggregates: Array<PackageResponseAggregate>, document: TextDocument) {
  const documentUrl = Uri.file(document.fileName);
  const codeLenses = [];
  aggregates.forEach((aggregate, index) => {
    codeLenses.push(createCodeLensFromEntry(aggregate, document, documentUrl));
  });

  return codeLenses;
}

// function createPackageFromNode(node) {
//   return {
//     name: node.packageInfo.name,
//     version: node.packageInfo.version,
//     meta: {
//       tag: {
//         name: 'latest',
//         version: 'latest',
//         isInvalid: false
//       }
//     },
//     order: 0
//   };
// }

function createCodeLensFromEntry(entry: PackageResponseAggregate, document: TextDocument, documentUrl) {
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
    documentUrl
  );
}