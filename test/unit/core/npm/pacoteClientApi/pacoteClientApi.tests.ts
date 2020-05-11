/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { testPath } from 'test/unit/utils';
import * as PacoteClientApi from 'core/providers/npm/pacoteClientApi'
import Fixtures from './pacoteClientApi.fixtures'

const assert = require('assert')
const path = require('path')
const mock = require('mock-require')
let pacoteMock = null

export default {

  beforeAll: () => {
    pacoteMock = {
      packument: {}
    }
    mock('pacote', pacoteMock)
  },

  afterAll: () => mock.stopAll,

  beforeEach: () => {
    // mock defaults
    pacoteMock.packument = (npaResult, opts) => { }
  },

  'fetchPackage': {

    'uses npmrc registry': async () => {
      const testPackagePath = path.join(testPath, './unit/core/npm/fixtures/config');
      const testPackageName = 'aliased';
      const testPackageVersion = 'npm:pacote@11.1.9';

      // setup initial call
      pacoteMock.packument = async (npaResult, opts) => {
        assert.equal(opts.cwd, testPackagePath)
        assert.equal(opts['//registry.npmjs.example/:_authToken'], '12345678')
        return Fixtures.packumentGit
      }

      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
    },

    'returns a file:// directory package': async () => {
      const expectedSource = 'directory';
      const testPackagePath = 'filepackagepath';
      const testPackageName = 'filepackage';
      const testPackageVersion = 'file://some/path/out/there';

      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
        .then((actual) => {
          assert.equal(actual.source, 'directory', `expected to see ${expectedSource}`)
        })
    },

    'returns a git:// package': async () => {
      const testPackagePath = 'packagepath';
      const testPackageName = 'npm';
      const testPackageVersion = 'git://github.com/npm/cli';

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGit);

      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.resolved.name, testPackageName)
        })
    },

    'returns a github#semver package': async () => {
      const testPackagePath = 'packagepath';
      const testPackageName = 'npm';
      const testPackageVersion = 'github:npm/cli#semver:6.5.*';

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGitSemver);
      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.type, 'range')
          assert.equal(actual.resolved.name, testPackageName)
        })
    },

    'returns a github#committish package': async () => {
      const testPackagePath = 'packagepath';
      const testPackageName = 'npm';
      const testPackageVersion = 'github:npm/cli#abdf528';

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGitCommittish);
      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.type, 'committish')
          assert.equal(actual.resolved.name, testPackageName)
        })
    },

    'returns a registry range package': async () => {
      const testPackagePath = 'packagepath';
      const testPackageName = 'pacote';
      const testPackageVersion = '10.1.*';

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryRange);
      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'range')
          assert.equal(actual.resolved.name, testPackageName)
        })
    },

    'returns a registry version package': async () => {
      const testPackagePath = 'packagepath';
      const testPackageName = 'npm-package-arg';
      const testPackageVersion = '8.0.1';

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryVersion);
      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'version')
          assert.equal(actual.resolved.name, testPackageName)
        })
    },

    'returns a registry alias package': async () => {
      const testPackagePath = 'packagepath';
      const testPackageName = 'aliased';
      const testPackageVersion = 'npm:pacote@11.1.9';

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryAlias);
      await PacoteClientApi.fetchPackage(testPackagePath, testPackageName, testPackageVersion)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'alias')
          assert.equal(actual.requested.name, testPackageName)
          assert.equal(actual.resolved.name, 'pacote')
        })
    },

  }

}