/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Range } from 'vscode';
import { DotNetAbstractCodeLensProvider } from './dotnetAbstractCodeLensProvider';
import { appConfig } from '../../common/appConfiguration';
import * as xmldoc from 'xmldoc';
import { parseDependencyNodes } from '../../common/dependencyParser';
import { generateCodeLenses } from '../../common/codeLensGeneration';

export class DotNetCSProjCodeLensProvider extends DotNetAbstractCodeLensProvider {

  get selector() {
    return {
      language: 'xml',
      scheme: 'file',
      pattern: '**/*.csproj'
    }
  }

  provideCodeLenses(document, token) {
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
}