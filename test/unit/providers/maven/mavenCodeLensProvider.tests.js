/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TestFixtureMap, generatePackage } from 'test/unit/utils';
import { PackageCodeLens } from 'common/packageCodeLens';
import { mavenDefaultDependencyProperties } from 'providers/maven/config';
import { MavenCodeLensProvider } from 'providers/maven/mavenCodeLensProvider';
import { parseVersion } from 'providers/maven/versionUtils'

const assert = require('assert');
const vscode = require('vscode');

const fixtureMap = new TestFixtureMap('./fixtures');

let testContext = null

export const MavenCodeLensProviderTests = {

  beforeEach: () => {
    testContext = {}
    testContext.testRange = new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 2)
    );

    testContext.testProvider = new MavenCodeLensProvider();

  },

  "parseVersions": {
    "Major should match": () => {
      const versions = ['1.2.3-SNAPSHOT', '4.0.0-M3', '4.3.0-M6', '42.2.5.jre6', '4.0.0-rc.1',
        '4.0.0.12', '4.0.0-alpha.17', '4.0.14-alpha', '4.16.0-dirty', '4.8.0-cr-2', '4.0.0-alpha.14',
        '4.11.2-5.8.1']

      assert.equal(parseVersion(versions[0]).version.major, 1)
      assert.equal(parseVersion(versions[1]).version.major, 4)
      assert.equal(parseVersion(versions[2]).version.major, 4)
      assert.equal(parseVersion(versions[3]).version.major, 42)
    }
  },

  "evaluateCodeLens": {

    "returns not found": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', null, { type: 'maven', packageNotFound: true }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
      assert.equal(result.command.command, undefined);
      assert.equal(result.command.arguments, undefined);
    },

    "returns tagged versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'alpha', version: '3.3.3-alpha.1', isPrimaryTag: false } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'alpha: \u2191 3.3.3-alpha.1', "Expected command.title failed.");
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.3.3-alpha.1"');
    },

    "returns fixed versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isFixedVersion: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Fixed to 3.3.3', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns prerelease versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', isFixedVersion: true, tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isNewerThanLatest: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Prerelease', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns latest version matches": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isLatestVersion: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns satisfies latest version": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, satisfiesLatest: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, 'Satisfies latest', "Expected command.title failed.");
      assert.equal(result.command.command, null);
      assert.equal(result.command.arguments, null);
    },

    "returns updatable versions": () => {
      const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'maven', tag: { name: 'satisfies', version: '3.2.1', isPrimaryTag: true } }), null);
      const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
      assert.equal(result.command.title, '\u2191 3.2.1');
      assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(result.command.arguments[1], '"3.2.1"');
    }

  }

}