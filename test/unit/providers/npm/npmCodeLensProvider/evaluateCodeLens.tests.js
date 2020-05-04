/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import appSettings from 'common/appSettings.js';
import { generatePackage } from 'test/unit/utils.js';
import { PackageCodeLens } from 'providers/shared/packageCodeLens';
import { NpmCodeLensProvider } from 'providers/npm/npmCodeLensProvider.js';

const assert = require('assert');
const vscode = require('vscode');

let testContext = null;

export default {

  beforeEach: () => {
    testContext = {};
    testContext.testProvider = new NpmCodeLensProvider();

    testContext.testRange = new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 2)
    );

    // mock app settings
    testContext.showDependencyStatusesMock = false;
    Reflect.defineProperty(
      appSettings,
      "showDependencyStatuses", {
        get: () => testContext.showDependencyStatusesMock
      }
    )
  },

  "returns not found": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', null, { type: 'npm', packageNotFound: true }), null);
    const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
    assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
    assert.equal(result.command.command, undefined);
    assert.equal(result.command.arguments, undefined);
  },

  "returns tagged versions": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'alpha', version: '3.3.3-alpha.1', isPrimaryTag: false } }), null);
    const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
    assert.equal(result.command.title, 'alpha: \u2191 3.3.3-alpha.1', "Expected command.title failed.");
    assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
    assert.equal(result.command.arguments[1], '3.3.3-alpha.1');
  },

  "returns fixed versions": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isFixedVersion: true } }), null);
    const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
    assert.equal(result.command.title, 'Fixed to 3.3.3', "Expected command.title failed.");
    assert.equal(result.command.command, null);
    assert.equal(result.command.arguments, null);
  },

  "returns prerelease versions": () => {
    const testPackage = generatePackage('SomePackage', '3.3.3', { type: 'npm', isFixedVersion: true, tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isNewerThanLatest: true } });
    const codeLens = new PackageCodeLens(testContext.testRange, null, testPackage, null);
    const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
    assert.equal(result.command.title, `Prerelease 3.3.3`, "Expected command.title failed.");
    assert.equal(result.command.command, null);
    assert.equal(result.command.arguments, null);
  },

  "returns latest version matches": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isLatestVersion: true } }), null);
    const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
    assert.equal(result.command.title, 'Latest', "Expected command.title failed.");
    assert.equal(result.command.command, null);
    assert.equal(result.command.arguments, null);
  },

  "returns satisfies latest version": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'npm', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, satisfiesLatest: true } }), null);
    const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
    assert.equal(result.command.title, 'Satisfies latest', "Expected command.title failed.");
    assert.equal(result.command.command, null);
    assert.equal(result.command.arguments, null);
  },

  "returns updatable versions": () => {
    const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'npm', tag: { name: 'satisfies', version: '3.2.1', isPrimaryTag: true } }), null);
    const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
    assert.equal(result.command.title, '\u2191 3.2.1');
    assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
    assert.equal(result.command.arguments[1], '3.2.1');
  }



}