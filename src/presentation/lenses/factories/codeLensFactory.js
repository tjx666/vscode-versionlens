import { VersionLens } from 'presentation/lenses/models/versionLens';

const { Range, Uri } = require('vscode');

export function createCodeLenses(packageCollection, document) {
  const documentUrl = Uri.file(document.fileName);
  return Promise.all(packageCollection)
    .then(results => {
      const codeLenses = [];
      results.forEach(entryOrEntries => {
        if (Array.isArray(entryOrEntries)) {
          entryOrEntries.forEach(
            (entry, order) => {
              entry.package.order = order;
              codeLenses.push(createCodeLensFromEntry(entry, document, documentUrl));
            }
          );
          return;
        }

        codeLenses.push(
          createCodeLensFromEntry(
            {
              node: entryOrEntries.node,
              package: createPackageFromNode(entryOrEntries.node)
            },
            document,
            documentUrl
          )
        );

      });

      return codeLenses;
    });
}

function createPackageFromNode(node) {
  return {
    name: node.packageInfo.name,
    version: node.packageInfo.version,
    meta: {
      tag: {
        name: 'latest',
        version: 'latest',
        isInvalid: false
      }
    },
    order: 0
  };
}

function createCodeLensFromEntry(entry, document, documentUrl) {
  const commandRangePos = entry.node.lensRange.start + entry.package.order;
  const commandRange = new Range(
    document.positionAt(commandRangePos),
    document.positionAt(commandRangePos)
  );
  const replaceRange = new Range(
    document.positionAt(entry.node.versionRange.start),
    document.positionAt(entry.node.versionRange.end)
  );
  return new VersionLens(
    commandRange,
    replaceRange,
    entry.package,
    documentUrl
  );
}