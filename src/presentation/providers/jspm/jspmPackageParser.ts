import { PackageDependencyLens } from 'core/packages/models/PackageDependencyLens';
import { extractPackageLensDataFromNodes } from 'core/packages/parsers/jsonPackageParser'

export function extractJspmLensDataFromText(packageJsonText: string, filterPropertyNames: string[]): PackageDependencyLens[] {
  const jsonParser = require("jsonc-parser");

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