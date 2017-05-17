/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as proxyquire from 'proxyquire';
import * as assert from 'assert';
import * as semver from 'semver';
import { PackageCodeLens } from '../../../src/common/packageCodeLens';
import * as CommandFactory from '../../../src/providers/commandFactory';

describe("CommandFactory", () => {

  beforeEach(() => {
    CommandFactory.createTestVersionCommand = (localVersion, serverVersion) => {
      const lens = new PackageCodeLens(null, null, { version: localVersion, meta: {} }, null);
      return CommandFactory.createVersionCommand(localVersion, serverVersion, lens);
    };
  });

  describe('createVersionCommand', () => {

    it("when local version is invalid then should return ErrorCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('blah', 'latest');
      assert.equal(testLens.command.title, 'Invalid version entered', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

    it("when server version is invalid then should return ErrorCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('1.2.3', '1.0.0.5');
      assert.equal(testLens.command.title, 'Invalid semver server version received, 1.0.0.5', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    })

    it("when local ranged version does not satisfy the server version then codeLens should return NewVersionCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('1.0.0 - 2.0.0', '2.8.0');
      assert.equal(testLens.command.title, '⮬ 2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"2.8.0"');
    });

    it("when local ranged version does satisfy the server version then codeLens should return SatisfiedCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('1.0.0 - 3.0.0', '2.8.0');
      assert.equal(testLens.command.title, 'Satisfies 2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

    it("when local version has caret and doesnt satisfies the server version then codeLens should return NewVersionCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('^1.8.0', '2.8.0');
      assert.equal(testLens.command.title, '⮬ 2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"^2.8.0"');
    });

    it("when local version has caret and satisfies the server version (and Matches) then codeLens should return SatisfiedCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('^2.0.0', '2.0.0');
      assert.equal(testLens.command.title, 'Satisfies 2.0.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

    it("when local version has caret and satisfies the server version then codeLens should return SatisfiedWithNewerCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('^2.0.0', '2.8.0');
      assert.equal(testLens.command.title, 'Satisfies ⮬ 2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"^2.8.0"');
    });

    it("when local version does not satisfy the server version then codeLens should return NewVersionCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('1.0.0', '2.8.0');
      assert.equal(testLens.command.title, '⮬ 2.8.0', "Expected command.title failed.");
      assert.equal(testLens.command.command, 'versionlens.updateDependencyCommand');
      assert.equal(testLens.command.arguments[1], '"2.8.0"');
    });

    it("when local version does satisfy the server version then codeLens should return LatestCommand", () => {
      const testLens = CommandFactory.createTestVersionCommand('2.8.0', '2.8.0');
      assert.equal(testLens.command.title, 'Latest', "Expected command.title failed.");
      assert.equal(testLens.command.command, undefined);
      assert.equal(testLens.command.arguments, undefined);
    });

  });

});