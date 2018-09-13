/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { TestFixtureMap, generatePackage } from 'test/unit/utils';
import { PackageCodeLens } from 'common/packageCodeLens';
import { mavenDefaultDependencyProperties } from 'providers/maven/config';
import { MavenCodeLensProvider } from 'providers/maven/mavenCodeLensProvider';
import { parseVersion, compareVersions, weightedQualifier } from 'providers/maven/versionUtils'

const assert = require('assert');
const vscode = require('vscode');

const fixtureMap = new TestFixtureMap('./fixtures');

let testContext = null

function assertIsOlder(versionA, versionB) {
  return (compareVersions(versionA, versionB) < 0)
}

function assertIsNewer(versionA, versionB) {
  return (compareVersions(versionA, versionB) > 0)
}

function assertIsSame(versionA, versionB) {
  return (compareVersions(versionA, versionB) === 0)
}

export const MavenCodeLensProviderTests = {

  beforeEach: () => {
    testContext = {}
    testContext.testRange = new vscode.Range(
      new vscode.Position(1, 1),
      new vscode.Position(1, 2)
    );

    testContext.testProvider = new MavenCodeLensProvider();

  },

  "Assert weigth of qualifiers": () => {
    assert.equal(weightedQualifier('alpha'), -7)
    assert.equal(weightedQualifier('beta'), -6)
    assert.equal(weightedQualifier('milestone'), -5)
    assert.equal(weightedQualifier('rc'), -4)
    assert.equal(weightedQualifier('snapshot'), -3)
    assert.equal(weightedQualifier('final'), -2)
    assert.equal(weightedQualifier('sp'), -1)
    assert.equal(weightedQualifier(''), '')
    assert.equal(weightedQualifier('abc'), 'abc')
  },
  "Assert that first version": {
    "Is older": () => {
      assert.equal(assertIsOlder("1", "2"), true, '"1" < "2"')
      assert.equal(assertIsOlder("1.5", "2"), true, '"1.5" < "2"')
      assert.equal(assertIsOlder("1", "2.5"), true, '"1" < "2.5"')
      assert.equal(assertIsOlder("1.0", "1.1"), true, '"1.0" < "1.1"')
      assert.equal(assertIsOlder("1.1", "1.2"), true, '"1.1" < "1.2"')
      assert.equal(assertIsOlder("1.0.0", "1.1"), true, '"1.0.0" < "1.1"')
      assert.equal(assertIsOlder("1.0.1", "1.1"), true, '"1.0.1" < "1.1"')
      assert.equal(assertIsOlder("1.1", "1.2.0"), true, '"1.1" < "1.2.0"')

      assert.equal(assertIsOlder("1.0-alpha-1", "1.0"), true, '"1.0-alpha-1" < "1.0"')
      assert.equal(assertIsOlder("1.0-alpha-1", "1.0-alpha-2"), true, '"1.0-alpha-1" < "1.0-alpha-2"')
      assert.equal(assertIsOlder("1.0-alpha-1", "1.0-beta-1"), true, '"1.0-alpha-1" < "1.0-beta-1"')

      assert.equal(assertIsOlder("1.0-beta-1", "1.0-SNAPSHOT"), true, '"1.0-beta-1" < "1.0-SNAPSHOT"')
      assert.equal(assertIsOlder("1.0-SNAPSHOT", "1.0"), true, '"1.0-SNAPSHOT" < "1.0"')
      assert.equal(assertIsOlder("1.0-alpha-1-SNAPSHOT", "1.0-alpha-1"), true, '"1.0-alpha-1-SNAPSHOT" < "1.0-alpha-1"')

      assert.equal(assertIsOlder("1.0", "1.0-1"), true, '"1.0" < "1.0-1"')
      assert.equal(assertIsOlder("1.0-1", "1.0-2"), true, '"1.0-1" < "1.0-2"')
      assert.equal(assertIsOlder("1.0.0", "1.0-1"), true, '"1.0.0" < "1.0-1"')

      assert.equal(assertIsOlder("2.0-1", "2.0.1"), true, '"2.0-1" < "2.0.1"')
      assert.equal(assertIsOlder("2.0.1-klm", "2.0.1-lmn"), true, '"2.0.1-klm" < "2.0.1-lmn"')
      assert.equal(assertIsOlder("2.0.1", "2.0.1-xyz"), true, '"2.0.1" < "2.0.1-xyz"')

      assert.equal(assertIsOlder("2.0.1", "2.0.1-123"), true, '"2.0.1" < "2.0.1-123"')
      assert.equal(assertIsOlder("2.0.1-xyz", "2.0.1-123"), true, '"2.0.1-xyz" < "2.0.1-123"')

    },
    "Is newer": () => {
      assert.equal(assertIsNewer("1.1", "1.0"), true, '"1.1" > "1.0"')
      assert.equal(assertIsNewer("1.1", "1.0.0"), true, '"1.1" > "1.0.0"')
      assert.equal(assertIsNewer("1.0", "1.0-alpha"), true, '"1.0" > "1.0-alpha"')
      assert.equal(assertIsNewer("3.8.1", "3.8"), true, '"3.8.1" > "3.8"')
    },
    "Is equal": () => {
      assert.equal(assertIsSame("1", "1.0"), true, '"1" = "1.0"')
      assert.equal(assertIsSame("2", "2.0.0"), true, '"2" = "2.0.0"')
    }
  },
  "parseVersions": {
    "Parsed should match": () => {
      assert.deepStrictEqual(parseVersion("1.2"), [1, 2])
      assert.deepStrictEqual(parseVersion("1.2-alpha"), [1, 2, [weightedQualifier('alpha')]])
    }
  },

  // "evaluateCodeLens": {

  //   "returns not found": () => {
  //     const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', null, { type: 'maven', packageNotFound: true }), null);
  //     const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
  //     assert.equal(result.command.title, 'SomePackage could not be found', "Expected command.title failed.");
  //     assert.equal(result.command.command, undefined);
  //     assert.equal(result.command.arguments, undefined);
  //   },

  //   "returns tagged versions": () => {
  //     const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'alpha', version: '3.3.3-alpha.1', isPrimaryTag: false } }), null);
  //     const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
  //     assert.equal(result.command.title, 'alpha: \u2191 3.3.3-alpha.1', "Expected command.title failed.");
  //     assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
  //     assert.equal(result.command.arguments[1], '"3.3.3-alpha.1"');
  //   },

  //   "returns fixed versions": () => {
  //     const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isFixedVersion: true } }), null);
  //     const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
  //     assert.equal(result.command.title, 'Fixed to 3.3.3', "Expected command.title failed.");
  //     assert.equal(result.command.command, null);
  //     assert.equal(result.command.arguments, null);
  //   },

  //   "returns prerelease versions": () => {
  //     const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', isFixedVersion: true, tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isNewerThanLatest: true } }), null);
  //     const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
  //     assert.equal(result.command.title, 'Prerelease', "Expected command.title failed.");
  //     assert.equal(result.command.command, null);
  //     assert.equal(result.command.arguments, null);
  //   },

  //   "returns latest version matches": () => {
  //     const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, isLatestVersion: true } }), null);
  //     const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
  //     assert.equal(result.command.title, 'Latest', "Expected command.title failed.");
  //     assert.equal(result.command.command, null);
  //     assert.equal(result.command.arguments, null);
  //   },

  //   "returns satisfies latest version": () => {
  //     const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '3.3.3', { type: 'maven', tag: { name: 'satisfies', version: '3.3.3', isPrimaryTag: true, satisfiesLatest: true } }), null);
  //     const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
  //     assert.equal(result.command.title, 'Satisfies latest', "Expected command.title failed.");
  //     assert.equal(result.command.command, null);
  //     assert.equal(result.command.arguments, null);
  //   },

  //   "returns updatable versions": () => {
  //     const codeLens = new PackageCodeLens(testContext.testRange, null, generatePackage('SomePackage', '1.2.3', { type: 'maven', tag: { name: 'satisfies', version: '3.2.1', isPrimaryTag: true } }), null);
  //     const result = testContext.testProvider.evaluateCodeLens(codeLens, null)
  //     assert.equal(result.command.title, '\u2191 3.2.1');
  //     assert.equal(result.command.command, 'versionlens.updateDependencyCommand');
  //     assert.equal(result.command.arguments[1], '"3.2.1"');
  //   }

  // }

}