/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {inject} from '../common/di';
import {PackageCodeLens} from '../common/packageCodeLens';
import {PackageCodeLensList} from '../common/packageCodeLensList';
import {AbstractCodeLensProvider} from './abstractCodeLensProvider';

const JspmDependencyRegex = /^npm:(.*)@(.*)$/;

@inject('jsonParser', 'npm')
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

      return npmViewVersion(this.npm, codeLensItem.packageName)
        .then(response => {
          let keys = Object.keys(response);
          let remoteVersion = keys[0];
          return super.makeVersionCommand(
            codeLensItem.packageVersion,
            remoteVersion,
            codeLensItem
          );
        }, error => {
          return super.makeErrorCommand(
            error,
            codeLensItem
          );
        });
    }
  }
}

function npmViewVersion(npm, packageName) {
  return new Promise((resolve, reject) => {
    npm.load(loadError => {
      if (loadError) {
        reject(loadError);
        return;
      }
      npm.view(packageName, 'version', (viewError, viewResult) => {
        if (viewError) {
          reject(viewError);
          return;
        }
        resolve(viewResult);
      });
    });
  });
}