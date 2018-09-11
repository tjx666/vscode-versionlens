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
      const versions = [
        "1.2-beta1",
        "1.0-alpha-2",
        "1.0-alpha1",
        "1.0.0", "1.1",
        "1.0-alpha-15",
        "7.0.18",
        "7.0.17",
        "7.0.16",
        "7.0.15",
        "7.0.14",
        "7.0.13",
        "7.0.12",
        "7.0.11",
        "7.0.10",
        "7.0.9",
        "7.0.8",
        "7.0.7",
        "7.0.6",
        "7.0.5",
        "7.0.4",
        "7.0.3",
        "7.0.2",
        "7.0.1",
        "7.0.0",
        "6.0.73",
        "6.0.72",
        "6.0.71",
        "6.0.70",
        "6.0.69",
        "6.0.68",
        "6.0.67",
        "6.0.66",
        "6.0.65",
        "6.0.64",
        "6.0.63",
        "6.0.62",
        "6.0.61",
        "6.0.60",
        "6.0.59",
        "6.0.58",
        "6.0.57",
        "6.0.56",
        "6.0.55",
        "6.0.54",
        "6.0.53",
        "6.0.52",
        "6.0.51",
        "6.0.50",
        "6.0.49",
        "6.0.48",
        "6.0.47",
        "6.0.46",
        "6.0.45",
        "6.0.44",
        "6.0.43",
        "6.0.42",
        "6.0.41",
        "6.0.40",
        "6.0.39",
        "6.0.38",
        "6.0.37",
        "6.0.36",
        "6.0.35",
        "6.0.34",
        "6.0.33",
        "6.0.32",
        "6.0.31",
        "4.2.8",
        "4.2.7",
        "4.2.6",
        "4.2.5",
        "4.2.4",
        "4.2.3",
        "4.2.2",
        "4.2.1",
        "4.2.0",
        "4.0.30",
        "4.0.29",
        "4.0.28-alpha",
        "4.0.27-alpha",
        "4.0.26-alpha",
        "4.0.25-alpha",
        "4.0.24-alpha",
        "4.0.23-alpha",
        "4.0.22-alpha",
        "4.0.21-alpha",
        "4.0.16-alpha2",
        "4.0.16-alpha10",
        "0.12.4",
        "0.12.3",
        "0.12.2",
        "0.12.1",
        "0.12.0",
        "0.0.3",
        "0.0.2",
        "0.0.1",
        "0.0.0"
      ]

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