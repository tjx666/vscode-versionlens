/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as httpRequest from 'request-light';
import * as xmldoc from 'xmldoc';
import * as CommandFactory from '../commandFactory';
import appSettings from '../../common/appSettings';
import { AbstractCodeLensProvider } from '../abstractCodeLensProvider';
import { Range } from 'vscode';
import { appConfig } from '../../common/appConfiguration';
import { parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';

// TODO retrieve multiple sources from nuget.config
const FEED_URL = 'https://api.nuget.org/v3-flatcontainer';

export class DotNetCodeLensProvider extends AbstractCodeLensProvider {


  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.{csproj,fsproj}'
    }
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return;

    const xmlDocument = new xmldoc.XmlDocument(document.getText());

    const dependencyNodes = this.extractDependencyNodes(
      document,
      xmlDocument
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appConfig
    );

    return generateCodeLenses(packageCollection, document);
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.makeLatestCommand(codeLens);

    const queryUrl = `${FEED_URL}/${codeLens.package.name}/index.json`;
    return httpRequest.xhr({ url: queryUrl })
      .then(response => {
        if (response.status != 200)
          return CommandFactory.makeErrorCommand(
            response.responseText,
            codeLens
          );

        const pkg = JSON.parse(response.responseText);
        const serverVersion = pkg.versions[pkg.versions.length - 1];
        if (!serverVersion)
          return CommandFactory.makeErrorCommand(
            "Invalid object returned from server",
            codeLens
          );

        return CommandFactory.makeVersionCommand(
          codeLens.package.version,
          serverVersion,
          codeLens
        );

      })
      .catch(errResponse => {
        console.error(`${errResponse.status}: ${queryUrl}`);
        return CommandFactory.makeErrorCommand(
          "An error occurred retrieving this package.",
          codeLens
        );
      })
  }


  extractDependencyNodes(document, xmlDocument) {
    const packageDependencyKeys = appConfig.dotnetCSProjDependencyProperties;

    const nodes = [];
    xmlDocument.eachChild(group => {
      if (group.name !== 'ItemGroup') return;
      group.eachChild(child => {
        if (!packageDependencyKeys.includes(child.name)) return;

        const line = document.getText(
          new Range(
            document.positionAt(child.startTagPosition - 1),
            document.positionAt(child.position)
          )
        );

        const start = line.indexOf(' Version="') + 9;
        const end = line.indexOf('"', start + 1);
        nodes.push({
          start: child.startTagPosition + start - 1,
          end: child.startTagPosition + end,
          name: child.attr.Include,
          value: child.attr.Version,
          replaceInfo: {
            start: child.startTagPosition + start - 1,
            end: child.startTagPosition + end,
          }
        });
      });
    });

    return nodes;
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