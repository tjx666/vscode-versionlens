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

  addDependencyNode(node, versionParser) {
    const packageNode = node.value;
    const commandRange = new Range(
      this.document.positionAt(packageNode.start),
      this.document.positionAt(packageNode.end)
    );
    const documentUrl = Uri.file(this.document.fileName);
    let replaceRange = commandRange;
    let packageInfo = {
      name: packageNode.location,
      version: packageNode.value,
      meta: null,
      isValidSemver: null
    };

    // handle cases where version is stored as a child property.
    if (packageNode.type === 'object') {
      const versionInfo = this.getVersionRangeFromParent_(packageNode);
      // if there isn't any version info then dont add this item
      if (!versionInfo)
        return;
      // update the version info
      replaceRange = versionInfo.range;
      packageInfo.version = versionInfo.version;
    }

    if (!versionParser) {
      // append a single code lens for rendering
      this.collection.push(new PackageCodeLens(commandRange, replaceRange, packageInfo, documentUrl));
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
        meta: parseResult.meta,
        isValidSemver: parseResult.isValidSemver,
        hasRangeSymbol: parseResult.hasRangeSymbol,
        customGenerateVersion: parseResult.customGenerateVersion
      };
      return new PackageCodeLens(commandRange, replaceRange, pkg, documentUrl);
    });

    this.collection.push.apply(this.collection, codeLensToAdd);
  }

  addNode(node) {
    const entryRange = new Range(
      this.document.positionAt(node.start),
      this.document.positionAt(node.end)
    );
    const documentUrl = Uri.file(this.document.fileName);
    const newCodeLens = new PackageCodeLens(entryRange, null, null, documentUrl);
    this.collection.push(newCodeLens);
    return newCodeLens;
  }

  addDependencyNodeRange(nodes, versionParser) {
    nodes.forEach(node => this.addDependencyNode(node, versionParser));
  }

  getVersionRangeFromParent_(parentNode) {
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