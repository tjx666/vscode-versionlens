/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range, Uri } from 'vscode';
import { assertDefined } from './typeAssertion';
import { PackageCodeLens } from './packageCodeLens';

export class PackageCodeLensList {

  constructor(document, appConfig) {
    assertDefined(
      document,
      "PackageCodeLensList: document parameter is invalid"
    );
    assertDefined(
      appConfig,
      "PackageCodeLensList: appConfig parameter is invalid"
    );
    this.collection = [];
    this.document = document;
    this.appConfig = appConfig;
  }

  add(node, versionParser) {
    const packageNode = node.value;
    const entryRange = new Range(
      this.document.positionAt(packageNode.start),
      this.document.positionAt(packageNode.end)
    );
    let versionRange = entryRange;
    let localUrl = Uri.file(this.document.fileName);
    let packageInfo = {
      name: packageNode.location,
      version: packageNode.value,
      meta: { localUrl },
      isValidSemver: null
    };

    // handle cases where version is stored as a child property.
    if (packageNode.type === 'object') {
      const versionInfo = this.getVersionRangeFromParent(packageNode);
      // if there isn't any version info then dont add this item
      if (!versionInfo)
        return;
      // update the version info
      versionRange = versionInfo.range;
      packageInfo.version = versionInfo.version;
    }

    if(!versionParser) {
      // append a single code lens for rendering
      this.collection.push(
        new PackageCodeLens(
          entryRange,
          versionRange,
          packageInfo,
          null
        )
      );
      return;
    }

    // execute the custom version parser (if present)
    const parseResults = versionParser(node, this.appConfig);
    if (!parseResults)
      return;

    const codeLensToAdd = parseResults.map(parseResult => {
      const pkg = {
        name: parseResult.packageName,
        version: parseResult.packageVersion,
        meta: parseResult.meta && Object.assign(parseResult.meta, { localUrl }),
        isValidSemver: parseResult.isValidSemver
      };
      return new PackageCodeLens(
        entryRange,
        versionRange,
        pkg,
        parseResult.customGenerateVersion
      );
    });

    this.collection.push.apply(this.collection,codeLensToAdd);
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
          version: childNode.value.value
        };
      }
    }
  }

}