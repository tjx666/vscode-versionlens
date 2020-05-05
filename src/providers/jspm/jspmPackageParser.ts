/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { PackageLensData } from "..//shared/packageLensData";
import { extractPackageLensDataFromNodes } from '../shared/jsonPackageParser'

const jsonParser = require("jsonc-parser");

export function extractJspmLensDataFromText(packageJsonText: string, filterPropertyNames: string[]): PackageLensData[] {
  const jsonErrors = [];
  const jsonTree = jsonParser.parseTree(packageJsonText, jsonErrors);
  if (!jsonTree || jsonTree.children.length === 0 || jsonErrors.length > 0) return [];

  const children = jsonTree.children;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const [keyEntry, valueEntry] = node.children;
    if (keyEntry.value === 'jspm') return extractPackageLensDataFromNodes(valueEntry.children, filterPropertyNames);
  }

  return [];
}