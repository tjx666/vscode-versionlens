/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {inject} from '../common/di';
import {PackageCodeLens} from '../models/packageCodeLens';
import {AbstractCodeLensProvider} from './abstractCodeLensProvider';
import {PackageCodeLensList} from '../lists/packageCodeLensList'

const JspmDependencyRegex = /^npm:(.*)@(.*)$/;

@inject('jsonParser', 'httpRequest')
export class NpmCodeLensProvider extends AbstractCodeLensProvider {

  constructor(config) {
    super(config);

    this.packageExtensions = {
      'jspm': node => {
        const m = JspmDependencyRegex.exec(node.value);
        if (!m)
          return undefined;

        const packageName = m[1];
        return {
          packageName: packageName,
          packageVersion: m[2],
          versionAdapter: (lens, version, adaptedVersion) => `npm:${packageName}@${adaptedVersion}`
        }
      }
    };
    this.packageExtensionsKeys = Object.keys(this.packageExtensions);

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
      const pkg = node.key.value;
      if (this.packageDependencyKeys.indexOf(pkg) !== -1) {
        collector.addRange(node.value.getChildNodes());
      }
      if (this.packageExtensionsKeys.indexOf(pkg) !== -1) {
        const customParser = this.packageExtensions[pkg];
        node.value.getChildNodes().forEach(n => collector.addRange(n.value.getChildNodes(), customParser));
      }
    });

    return collector.list;
  }

  resolveCodeLens(codeLensItem, token) {
    if (codeLensItem instanceof PackageCodeLens) {
      let requestVersion = 'latest';

      if (codeLensItem.packageVersion === requestVersion) {
        super.makeLatestCommand(codeLensItem);
        return;
      }

      // encode the package name
      let packageUriComponent = encodeURIComponent(codeLensItem.packageName);
      // ensure that any scoped packages maintain their @ symbol in the uri
      if (codeLensItem.packageName[0] === '@') {
        packageUriComponent = packageUriComponent.replace('%40', '@');
        // work around for https://github.com/npm/registry/issues/34#issuecomment-231594567
        requestVersion = '*';
      }

      const queryUrl = `http://registry.npmjs.org/${packageUriComponent}/${requestVersion}`;
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