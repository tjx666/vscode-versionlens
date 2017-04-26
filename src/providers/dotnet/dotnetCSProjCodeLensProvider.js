/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range } from 'vscode';
import { PackageCodeLensList } from '../../common/packageCodeLensList';
import { DotNetAbstractCodeLensProvider } from './dotnetAbstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as xmldoc from 'xmldoc';

export class DotNetCSProjCodeLensProvider extends DotNetAbstractCodeLensProvider {

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.csproj'
    }
  }

  getPackageDependencyKeys() {
    return appConfig.dotnetCSProjDependencyProperties;
  }

  provideCodeLenses(document, token) {
    const xmlDocument = new xmldoc.XmlDocument(document.getText());

    const collector = new PackageCodeLensList(document, appConfig);
    this.collectDependencies_(collector, document, xmlDocument, null);
    if (collector.collection.length === 0)
      return [];

    return collector.collection;
  }

  collectDependencies_(collector, document, xmlDocument, customVersionParser) {
    const packageDependencyKeys = this.getPackageDependencyKeys();

    const nodes = [];
    xmlDocument.eachChild(group => {
      if (group.name !== 'ItemGroup') return;
      group.eachChild(child => {
        if (!packageDependencyKeys.includes(child.name)) return;

        const line = document.getText(new Range(
          document.positionAt(child.startTagPosition - 1),
          document.positionAt(child.position)
        ));

        const start = line.indexOf(' Version="') + 9;
        const end = line.indexOf('"', start + 1);
        nodes.push({
          value: {
            start: child.startTagPosition + start - 1,
            end: child.startTagPosition + end,
            location: child.attr.Include,
            value: child.attr.Version,
            type: 'string'
          }
        });
      });
    });

    if (nodes.length > 0) {
      collector.addDependencyNodeRange(nodes, customVersionParser);
    }
  }
}