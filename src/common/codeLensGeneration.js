/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageCodeLens } from './packageCodeLens';

const { Range, Uri } = require('vscode');

export function generateCodeLenses(packageCollection, document) {
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
    name: node.name,
    version: node.replaceInfo.value || node.value,
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
  const commandRangePos = entry.node.start + entry.package.order;
  const commandRange = new Range(
    document.positionAt(commandRangePos),
    document.positionAt(commandRangePos)
  );
  const replaceRange = new Range(
    document.positionAt(entry.node.replaceInfo.start),
    document.positionAt(entry.node.replaceInfo.end)
  );
  return new PackageCodeLens(
    commandRange,
    replaceRange,
    entry.package,
    documentUrl
  );
}