import * as VsCodeTypes from 'vscode';

import { PackageDependencyLens } from "core/packages";

const xmldoc = require('xmldoc');
const { window } = require('vscode');

export function extractMavenLensDataFromDocument(document: VsCodeTypes.TextDocument, filterPropertyNames: string[]): PackageDependencyLens[] {
  const xmlDoc = new xmldoc.XmlDocument(document.getText());
  if (!xmlDoc) return [];

  return extractPackageLensDataFromNodes(xmlDoc, document, filterPropertyNames);
}

function extractPackageLensDataFromNodes(rootNode, document, filterProperties) {
  const collector = [];
  rootNode.eachChild(group => {

    switch (group.name) {
      case "dependencies":
        group.eachChild(childNode => {
          if (!filterProperties.includes(childNode.name)) return;
          collectFromChildVersionTag(childNode, collector)
        });
        break;

      case "parent":
        if (!filterProperties.includes(group.name)) return;
        collectFromChildVersionTag(group, collector)
        break;

      default:
        break;
    }
  });

  return collector;
}

function extractPropertiesFromFile() {
  let properties = []
  if (window.activeTextEditor) {
    let xmlCurrentPom = new xmldoc.XmlDocument(window.activeTextEditor.document.getText())
    let propertiesCurrentPom = xmlCurrentPom.descendantWithPath("properties")
    propertiesCurrentPom.eachChild(property => {
      properties.push({
        name: property.name,
        val: property.val,
        position: property.position
      })
    })
  }
  return properties;
}


function collectFromChildVersionTag(parentNode, collector) {
  parentNode.eachChild(childNode => {
    let versionNode;
    if (childNode.name !== "version") return;

    if (childNode.val.indexOf("$") >= 0) {
      let properties = extractPropertiesFromFile();
      let name = childNode.val.replace(/\$|\{|\}/ig, '')
      versionNode = properties.filter(property => {
        return property.name === name
      })[0]
    } else {
      versionNode = childNode;
    }
    // TODO: Check if is a version variable like '${spring.version}' and evaluate to get the real version

    const nameRange = {
      start: parentNode.startTagPosition,
      end: parentNode.startTagPosition,
    };

    const versionRange = {
      start: versionNode.position,
      end: versionNode.position + versionNode.val.length,
    };

    let group = parentNode.childNamed("groupId").val
    let artifact = parentNode.childNamed("artifactId").val

    //TOFIX: properties object is causing error because it's missing
    // let match = /\$\{(.*)\}/ig.exec(artifact);
    // if (match) {
    //   let property = properties.filter(property => {
    //     return property.name === match[1]
    //   })[0]
    //   artifact = artifact.replace(/\$\{.*\}/ig, property.val)
    // }

    const packageInfo = {
      name: group + ":" + artifact,
      version: versionNode.val,
    }

    collector.push({
      nameRange,
      versionRange,
      packageInfo
    });
  });
}