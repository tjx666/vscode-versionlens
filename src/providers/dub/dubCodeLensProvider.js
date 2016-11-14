/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../../common/di';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';

@inject('jsonParser', 'httpRequest')
export class DubCodeLensProvider extends AbstractCodeLensProvider {

  constructor(config) {
    super(config);
    this.packageDependencyKeys = [
      'dependencies'
    ];
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/dub.json'
    };
  }

  collectDependencies_(collector, root, customVersionParser) {
    root.getChildNodes().forEach((node) => {
      if (this.packageDependencyKeys.indexOf(node.key.value) !== -1) {
        collector.addRange(node.value.getChildNodes(), customVersionParser);
        return;
      }

      if (node.key.value == "subPackages") {
        node.value.items
          .forEach(subPackage => {
            if (subPackage.type == "object")
              this.collectDependencies_(collector, subPackage, customVersionParser);
          });
      }
    });
  }

  provideCodeLenses(document, token) {
    const jsonDoc = this.jsonParser.parse(document.getText());
    if (!jsonDoc || !jsonDoc.root || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document);
    this.collectDependencies_(collector, jsonDoc.root, null);
    return collector.collection;
  }

  resolveCodeLens(codeLensItem, token) {
    if (codeLensItem instanceof PackageCodeLens) {

      if (codeLensItem.packageVersion === 'latest') {
        super.makeLatestCommand(codeLensItem);
        return;
      }

      if (codeLensItem.packageVersion === '~master') {
        super.makeLatestCommand(codeLensItem);
        return;
      }

      const queryUrl = `http://code.dlang.org/api/packages/${encodeURIComponent(codeLensItem.packageName)}/latest`;
      return this.httpRequest.xhr({ url: queryUrl })
        .then(response => {
          if (response.status != 200)
            return super.makeErrorCommand(
              response.responseText,
              codeLensItem
            );

          const verionStr = JSON.parse(response.responseText);
          if (typeof verionStr !== "string")
            return super.makeErrorCommand(
              "Invalid object returned from server",
              codeLensItem
            );

          return super.makeVersionCommand(
            codeLensItem.packageVersion,
            verionStr,
            codeLensItem
          );
        })
        .catch(response => {
          const respObj = JSON.parse(response.responseText);
          return super.makeErrorCommand(
            respObj.statusMessage,
            codeLensItem
          );
        });
    }
  }
}