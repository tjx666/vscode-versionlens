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

function assertOrder(versionA, versionB) {
  return (compareVersions(versionA, versionB) < 0)
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
    "Is in order": () => {
      assert.equal(assertOrder("0.99", "1"), true, '"0.99" < "1"')
      assert.equal(assertOrder("1", "2"), true, '"1" < "2"')
      assert.equal(assertOrder("1.5", "2"), true, '"1.5" < "2"')
      assert.equal(assertOrder("1", "2.5"), true, '"1" < "2.5"')
      assert.equal(assertOrder("1.0", "1.1"), true, '"1.0" < "1.1"')
      assert.equal(assertOrder("1.1", "1.2"), true, '"1.1" < "1.2"')
      assert.equal(assertOrder("1.0.0", "1.1"), true, '"1.0.0" < "1.1"')
      assert.equal(assertOrder("1.0.1", "1.1"), true, '"1.0.1" < "1.1"')
      assert.equal(assertOrder("1.1", "1.2.0"), true, '"1.1" < "1.2.0"')
      assert.equal(assertOrder("3.8", "3.8.1"), true, '"3.8" < "3.8.1"')

      assert.equal(assertOrder("1.0-alpha-1", "1.0"), true, '"1.0-alpha-1" < "1.0"')
      assert.equal(assertOrder("1.0-alpha-1", "1.0-alpha-2"), true, '"1.0-alpha-1" < "1.0-alpha-2"')
      assert.equal(assertOrder("1.0-alpha-1", "1.0-beta-1"), true, '"1.0-alpha-1" < "1.0-beta-1"')

      assert.equal(assertOrder("1.0.1.20170215.211020-2", "1.0.7-SNAPSHOT"), true, '"1.0.1.20170215.211020-2" < "1.0.7-SNAPSHOT"')

      assert.equal(assertOrder("1.0-beta-1", "1.0-SNAPSHOT"), true, '"1.0-beta-1" < "1.0-SNAPSHOT"')
      assert.equal(assertOrder("1.0-SNAPSHOT", "1.0"), true, '"1.0-SNAPSHOT" < "1.0"')
      assert.equal(assertOrder("1.0-alpha-1-SNAPSHOT", "1.0-alpha-1"), true, '"1.0-alpha-1-SNAPSHOT" < "1.0-alpha-1"')

      assert.equal(assertOrder("1.0", "1.0-1"), true, '"1.0" < "1.0-1"')
      assert.equal(assertOrder("1.0.0", "1.0-1"), true, '"1.0.0" < "1.0-1"')
      assert.equal(assertOrder("1.0-1", "1.0.1"), true, '"1.0-1" < "1.0.1"')
      assert.equal(assertOrder("1.0-1", "1.0-2"), true, '"1.0-1" < "1.0-2"')

      assert.equal(assertOrder("1.0-alpha", "1.0"), true, '"1.0-alpha" < "1.0"')
      assert.equal(assertOrder("2.0-1", "2.0.1"), true, '"2.0-1" < "2.0.1"')
      assert.equal(assertOrder("2.0.1-klm", "2.0.1-lmn"), true, '"2.0.1-klm" < "2.0.1-lmn"')
      assert.equal(assertOrder("2.0.1", "2.0.1-xyz"), true, '"2.0.1" < "2.0.1-xyz"')

      assert.equal(assertOrder("2.0.1", "2.0.1-123"), true, '"2.0.1" < "2.0.1-123"')
      assert.equal(assertOrder("2.0.1-xyz", "2.0.1-123"), true, '"2.0.1-xyz" < "2.0.1-123"')



    },
    "Is equal": () => {
      assert.equal(assertIsSame("1", "1.0"), true, '"1" = "1.0"')
      assert.equal(assertIsSame("2", "2.0.0"), true, '"2" = "2.0.0"')
      assert.equal(assertIsSame("3.8.0", "3.8"), true, '"3.8.0" = "3.8"')
    }
  },
  "parseVersions": {
    "Parsed should match": () => {
      assert.deepStrictEqual(parseVersion("1.2"), [1, 2])
      assert.deepStrictEqual(parseVersion("1.2-alpha"), [1, 2, [weightedQualifier('alpha')]])
    }
  }
}