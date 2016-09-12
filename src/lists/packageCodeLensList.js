/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {assertDefined} from '../common/typeAssertion';
import {Range, Uri} from 'vscode';
import {PackageCodeLens} from '../models/packageCodeLens';

export class PackageCodeLensList {

  constructor(document) {
    assertDefined(
      document,
      "PackageCodeLensList: document parameter is invalid"
    );
    this.collection = [];
    this.document = document;
  }

  add(node, customParser) {
    const packageEntry = node.value;
    const idRange = new Range(
      this.document.positionAt(packageEntry.start),
      this.document.positionAt(packageEntry.end)
    );

    let packageName = packageEntry.name;
    let packageVersion = packageEntry.value;
    let versionRange = idRange;
    let versionAdapter;

    if (customParser) {
      let pkg = customParser(packageEntry);
      if (!pkg)
        return false;
      packageName = pkg.packageName;
      packageVersion = pkg.packageVersion;
      versionAdapter = pkg.versionAdapter;
    }

    // handle cases where version is stored as a child property.
    if (packageEntry.type === 'object') {
      const versionInfo = this.getVersionRangeFromParent(packageEntry);
      // if there isn't any version info then dont add this item
      if (versionInfo === undefined)
        return false;

      versionRange = versionInfo.range;
      packageVersion = versionInfo.value;
    }

    this.collection.push(
      new PackageCodeLens(
        idRange,
        versionRange,
        Uri.file(this.document.fileName),
        packageName,
        packageVersion,
        versionAdapter
      )
    );
  }

  addRange(nodes, customParser) {
    nodes.forEach((node) => this.add(node, customParser));
  }

  get list() {
    return this.collection;
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
          ), value: childNode.value.value
        };
      }
    }
  }

}