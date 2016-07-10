/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {inject} from '../common/di';
import {PackageCodeLens} from '../models/packageCodeLens';
import {AbstractCodeLensProvider} from './abstractCodeLensProvider';
import {PackageCodeLensList} from '../lists/packageCodeLensList'

@inject('jsonParser', 'httpRequest')
export class NpmCodeLensProvider extends AbstractCodeLensProvider {

  constructor(config) {
    super(config);
    this.packageDependencyKeys = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies'
    ];
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/package.json'
    }
  };

  provideCodeLenses(document, token) {
    const jsonDoc = this.jsonParser.parse(document.getText());
    const collector = new PackageCodeLensList(document);

    if (jsonDoc === null || jsonDoc.root === null)
      return [];

    if (jsonDoc.validationResult.errors.length > 0)
      return [];

    jsonDoc.root.getChildNodes().forEach((node) => {
      if (this.packageDependencyKeys.indexOf(node.key.value) !== -1) {
        collector.addRange(node.value.getChildNodes());
      }
    });

    return collector.list;
  }

  resolveCodeLens(codeLensItem, token) {
    if (codeLensItem instanceof PackageCodeLens) {

      if (codeLensItem.packageVersion === '*') {
        super.makeLatestCommand(codeLensItem);
        return;
      }

      // encode the package name
      let packageUriComponent = encodeURIComponent(codeLensItem.packageName);
      // ensure that any scoped packages maintain their @ symbol in the uri
      if (codeLensItem.packageName[0] === '@')
        packageUriComponent = packageUriComponent.replace('%40', '@');

      const queryUrl = `http://registry.npmjs.org/${packageUriComponent}/*`;
      return this.httpRequest.xhr({ url: queryUrl })
        .then(response => {
          if (response.status != 200)
            return super.makeErrorCommand(
              response.status,
              response.responseText,
              codeLensItem
            );

          const serverObj = JSON.parse(response.responseText);
          if (!serverObj || !serverObj.version)
            return super.makeErrorCommand(
              -1,
              "Invalid object returned from server",
              codeLensItem
            );

          return super.makeVersionCommand(
            codeLensItem.packageVersion,
            serverObj.version,
            codeLensItem
          );
        }, response => {
          const respObj = JSON.parse(response.responseText);
          return super.makeErrorCommand(
            response.status,
            respObj.error,
            codeLensItem
          );
        });
    }
  }
}