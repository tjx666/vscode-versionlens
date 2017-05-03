/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range, Uri } from 'vscode';
import { PackageCodeLens } from './packageCodeLens';

export function generateCodeLenses(packageCollection, document) {
  const documentUrl = Uri.file(document.fileName);
  return Promise.all(packageCollection)
    .then(results => {
      const codeLenses = [];
      results.forEach(entryOrEntries => {
        if (Array.isArray(entryOrEntries)) {
          entryOrEntries.forEach(
            entry => {
              codeLenses.push(createCodeLensFromEntry(entry, document, documentUrl));
            }
          );
          return;
        }

        codeLenses.push(
          createCodeLensFromEntry(
            {
              node: entryOrEntries.node,
              package: createPackageFromEntry(entryOrEntries.node)
            },
            document,
            documentUrl
          )
        );

      });
      console.log(codeLenses)
      return codeLenses;
    });
}

function createPackageFromEntry(node) {
  return {
    name: node.name,
    version: node.replaceInfo.value || node.value,
    meta: {
      tag: 'latest'
    },
    isValidSemver: null
  };
}

function createCodeLensFromEntry(entry, document, documentUrl) {
  const commandRange = new Range(
    document.positionAt(entry.node.start),
    document.positionAt(entry.node.end)
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