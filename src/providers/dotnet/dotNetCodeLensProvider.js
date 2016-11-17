/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from '../../common/di';
import { PackageCodeLens } from '../../common/packageCodeLens';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';

// TODO retrieve multiple sources from nuget.config
const FEED_URL = 'https://api.nuget.org/v3-flatcontainer';

@inject('jsonParser', 'httpRequest', 'appConfig')
export class DotNetCodeLensProvider extends AbstractCodeLensProvider {

  constructor() {
    this.packageDependencyKeys = [
      'dependencies',
      'tools'
    ];
  }

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/project.json'
    }
  };

  provideCodeLenses(document, token) {
    const jsonDoc = this.jsonParser.parse(document.getText());
    if (jsonDoc === null || jsonDoc.root === null || jsonDoc.validationResult.errors.length > 0)
      return [];

    const collector = new PackageCodeLensList(document, this.appConfig);
    this.collectDependencies_(collector, jsonDoc.root, null);
    return collector.collection;
  }

  resolveCodeLens(codeLensItem, token) {
    if (codeLensItem instanceof PackageCodeLens) {

      if (codeLensItem.package.version === 'latest') {
        this.commandFactory.makeLatestCommand(codeLensItem);
        return;
      }

      const queryUrl = `${FEED_URL}/${codeLensItem.package.name}/index.json`;
      return this.httpRequest.xhr({ url: queryUrl })
        .then(response => {
          if (response.status != 200)
            return this.commandFactory.makeErrorCommand(
              response.responseText,
              codeLensItem
            );

          const pkg = JSON.parse(response.responseText);
          const serverVersion = pkg.versions[pkg.versions.length - 1];
          if (!serverVersion)
            return this.commandFactory.makeErrorCommand(
              "Invalid object returned from server",
              codeLensItem
            );

          return this.commandFactory.makeVersionCommand(
            codeLensItem.package.version,
            serverVersion,
            codeLensItem
          );

        })
        .catch(errResponse => {
          return this.commandFactory.makeErrorCommand(
            `${errResponse.status}: ${queryUrl}`,
            codeLensItem
          );
        });
    }
  }

  collectDependencies_(collector, node, customVersionParser) {
    const childNodes = node.getChildNodes();
    childNodes.forEach(childNode => {
      if (this.packageDependencyKeys.indexOf(childNode.key.value) !== -1)
        collector.addRange(childNode.value.getChildNodes(), customVersionParser);
      else if (childNode.value.type === 'object')
        this.collectDependencies_(collector, childNode.value, customVersionParser);
    });
  }

  createRequestUrl_(baseUrl, packageId) {
    return `${baseUrl}/${packageId}/index.json`;
  }

  extractVersionFromXml_(xmlResponse) {
    const versionExp = /<d:Version>(.*)<\/d:Version>/;
    const results = xmlResponse.match(versionExp);
    return results && results.length > 1 ? results[1] : '';
  }

  getPackageSources_() {
    return [''];
  }

}