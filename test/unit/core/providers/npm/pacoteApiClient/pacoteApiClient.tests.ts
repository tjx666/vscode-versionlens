import { testPath } from 'test/unit/utils';
import * as PacoteApiClient from 'core/providers/npm/pacoteApiClient'
import Fixtures from './pacoteApiClient.fixtures'

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
      const testRequest = {
        packagePath: path.join(testPath, './unit/core/providers/npm/fixtures/config'),
        packageName: 'aliased',
        packageVersion: 'npm:pacote@11.1.9',
      }

      // setup initial call
      pacoteMock.packument = async (npaResult, opts) => {
        assert.equal(opts.cwd, testRequest.packagePath)
        assert.equal(opts['//registry.npmjs.example/:_authToken'], '12345678')
        return Fixtures.packumentGit
      }

      await PacoteApiClient.fetchPackage(testRequest)
    },

    'returns a file:// directory package': async () => {
      const expectedSource = 'directory';

      const testRequest = {
        packagePath: 'filepackagepath',
        packageName: 'filepackage',
        packageVersion: 'file://some/path/out/there',
      }

      await PacoteApiClient.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'directory', `expected to see ${expectedSource}`)
        })
    },

    'returns a git:// package': async () => {

      const testRequest = {
        packagePath: 'packagepath',
        packageName: 'npm',
        packageVersion: 'git://github.com/npm/cli',
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGit);

      await PacoteApiClient.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.resolved.name, testRequest.packageName)
        })
    },

    'returns a github#semver package': async () => {
      const testRequest = {
        packagePath: 'packagepath',
        packageName: 'npm',
        packageVersion: 'github:npm/cli#semver:6.5.*',
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGitSemver);
      await PacoteApiClient.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.type, 'range')
          assert.equal(actual.resolved.name, testRequest.packageName)
        })
    },

    'returns a github#committish package': async () => {

      const testRequest = {
        packagePath: 'packagepath',
        packageName: 'npm',
        packageVersion: 'github:npm/cli#abdf528',
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGitCommittish);
      await PacoteApiClient.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.type, 'committish')
          assert.equal(actual.resolved.name, testRequest.packageName)
        })
    },

    'returns a registry range package': async () => {

      const testRequest = {
        packagePath: 'packagepath',
        packageName: 'pacote',
        packageVersion: '10.1.*',
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryRange);
      await PacoteApiClient.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'range')
          assert.equal(actual.resolved.name, testRequest.packageName)
        })
    },

    'returns a registry version package': async () => {

      const testRequest = {
        packagePath: 'packagepath',
        packageName: 'npm-package-arg',
        packageVersion: '8.0.1',
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryVersion);
      await PacoteApiClient.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'version')
          assert.equal(actual.resolved.name, testRequest.packageName)
        })
    },

    'returns a registry alias package': async () => {
      const testRequest = {
        packagePath: 'packagepath',
        packageName: 'aliased',
        packageVersion: 'npm:pacote@11.1.9',
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryAlias);
      await PacoteApiClient.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'alias')
          assert.equal(actual.requested.name, testRequest.packageName)
          assert.equal(actual.resolved.name, 'pacote')
        })
    },

  }

}