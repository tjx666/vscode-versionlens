/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range, Uri } from 'vscode';
import { assertDefined } from './typeAssertion';
import { PackageCodeLens } from './packageCodeLens';

export class PackageCodeLensList {

  constructor(document) {
    assertDefined(
      document,
      "PackageCodeLensList: document parameter is invalid"
    );
    this.collection = [];
    this.document = document;
  }

  add(node, versionParser) {
    const packageEntry = node.value;
    const entryRange = new Range(
      this.document.positionAt(packageEntry.start),
      this.document.positionAt(packageEntry.end)
    );
    let packageName = packageEntry.location;
    let packageVersion = packageEntry.value;
    let versionRange = entryRange;
    let commandMeta;
    let versionAdapter;
    let isValidSemver;

    // handle cases where version is stored as a child property.
    if (packageEntry.type === 'object') {
      const versionInfo = this.getVersionRangeFromParent(packageEntry);
      // if there isn't any version info then dont add this item
      if (!versionInfo)
        return false;
      // update the version info
      versionRange = versionInfo.range;
      packageVersion = versionInfo.value;
    }

    // execute the custom version parser (if present)
    if (versionParser) {
      let parseResult = versionParser(node);
      if (!parseResult)
        return false;
      packageName = parseResult.packageName;
      packageVersion = parseResult.packageVersion;
      versionAdapter = parseResult.versionAdapter;
      commandMeta = parseResult.commandMeta;
      isValidSemver = parseResult.isValidSemver;
    }

    // append a new code lens for rendering
    this.collection.push(
      new PackageCodeLens(
        entryRange,
        versionRange,
        Uri.file(this.document.fileName),
        packageName,
        packageVersion,
        commandMeta,
        isValidSemver,
        versionAdapter
      )
    );
  }

  addRange(nodes, versionParser) {
    nodes.forEach(node => this.add(node, versionParser));
  }

  getVersionRangeFromParent(parentNode) {
    const childNodes = parentNode.getChildNodes();
    for (var i = 0; i < childNodes.length; i++) {
      var childNode = childNodes[i];
      if (childNode.key.value === 'version') {
        return {
          range: new Range(
            this.document.positionAt(childNode.value.start),
            this.document.positionAt(childNode.value.end)
          ),
          value: childNode.value.value
        };
      }
    }
  }

}