/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workspace } from 'vscode';
import { clearDecorations } from '../editor/decorations';

export const fileDependencyRegex = /^file:(.*)$/;
export const gitHubDependencyRegex = /^\/?([^:\/\s]+)(\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
export const stripSymbolFromVersionRegex = /^(?:[^0-9]+)?(.+)$/;
export const extractSymbolFromVersionRegex = /^([^0-9]*)?.*$/;
export const semverLeadingChars = ['^', '~', '<', '<=', '>', '>=', '~>'];
export const formatTagNameRegex = /^[^0-9\-]*/;

export function formatWithExistingLeading(existingVersion, newVersion) {
  const regExResult = extractSymbolFromVersionRegex.exec(existingVersion);
  const leading = regExResult && regExResult[1];
  if (!leading || !semverLeadingChars.includes(leading))
    return newVersion;

  return `${leading}${newVersion}`;
}

export function refreshCodeLens() {
  const key = 'editor.codeLens';
  const workspaceConfiguration = workspace.getConfiguration();
  const codeLensEnabled = workspaceConfiguration.inspect(key);
  if (codeLensEnabled === false)
    return;

  // clear any decorations
  clearDecorations();

  // turn off codelens
  workspaceConfiguration.update(key, false, true);

  // turn on code lens after 500 ms
  setTimeout(function () {
    // turn on codelens to refesh them
    workspaceConfiguration.update(key, true, true);
  }, 500);

}

export function flatMap(array, lambda) {
  return [].concat(
    ...array.map(lambda)
  );
};

export function sortDescending(a, b) {
  if (a > b)
    return -1;
  if (a < b)
    return 1;
  return 0;
}

export function createChainMutator(mutators) {
  const propertyMap = {
    state: {
      value: null,
      enumerable: false,
      writable: true
    },
    toValue: {
      value: function () {
        return this.state;
      }
    },
    set: {
      value: function (newState) {
        this.state = newState;
        return this;
      }
    },
    log: {
      value: function (...args) {
        console.log.call(console, ...args, this.state);
        return this;
      }
    },
  };

  mutators.forEach(fn => {
    propertyMap[fn.name] = {
      value: function (...args) {
        this.state = fn.call(this.state, ...args);
        return this;
      }
    }
  });

  return Object.create({}, propertyMap);
}
