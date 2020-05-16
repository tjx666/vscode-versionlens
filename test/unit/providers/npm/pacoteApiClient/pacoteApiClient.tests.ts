import { testPath } from 'test/unit/utils';
import { PacoteClient } from 'providers/npm/clients/pacoteClient'
import Fixtures from './pacoteApiClient.fixtures'
import { NpmConfig } from '/providers/npm/config';
import { LoggerMock } from 'test/unit/mocks/loggerMock';
import { AppConfig } from '/presentation/extension';
import { IConfig } from '/core/configuration';

const assert = require('assert')
const path = require('path')
const mock = require('mock-require')

let pacoteMock = null
let defaultConfigMock: AppConfig;

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

    defaultConfigMock = new AppConfig(<IConfig>{
      get: (k) => undefined
    });
  },

  'fetchPackage': {

    'uses npmrc registry': async () => {
      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        source: 'npmtest',
        package: {
          path: path.join(testPath, './unit/providers/npm/fixtures/config'),
          name: 'aliased',
          version: 'npm:pacote@11.1.9',
        },
      }

      assert.ok(require('fs').existsSync(testRequest.package.path), 'test .npmrc doesnt exist?')

      // setup initial call
      pacoteMock.packument = async (npaResult, opts) => {
        assert.equal(opts.cwd, testRequest.package.path)
        assert.equal(opts['//registry.npmjs.example/:_authToken'], '12345678')
        return Fixtures.packumentGit
      }

      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
    },

    'returns a file:// directory package': async () => {
      const expectedSource = 'directory';

      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        source: 'npmtest',
        package: {
          path: 'filepackagepath',
          name: 'filepackage',
          version: 'file://some/path/out/there',
        }
      }


      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'directory', `expected to see ${expectedSource}`)
          assert.deepEqual(actual.requested, testRequest.package)
        })
    },

    'returns a git:// package': async () => {

      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'npm',
          version: 'git://github.com/npm/cli',
        }
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGit);

      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.resolved.name, testRequest.package.name)
          assert.deepEqual(actual.requested, testRequest.package)
        })
    },

    'returns a github#semver package': async () => {

      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'npm',
          version: 'github:npm/cli#semver:6.5.*',
        }
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGitSemver);
      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.type, 'range')
          assert.equal(actual.resolved.name, testRequest.package.name)
          assert.deepEqual(actual.requested, testRequest.package)
        })
    },

    'returns a github#committish package': async () => {

      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'npm',
          version: 'github:npm/cli#abdf528',
        }
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentGitCommittish);
      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.type, 'committish')
          assert.equal(actual.resolved.name, testRequest.package.name)
          assert.deepEqual(actual.requested, testRequest.package)
        })
    },

    'returns a registry range package': async () => {

      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'pacote',
          version: '10.1.*',
        }
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryRange);
      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'range')
          assert.equal(actual.resolved.name, testRequest.package.name)
          assert.deepEqual(actual.requested, testRequest.package)
        })
    },

    'returns a registry version package': async () => {

      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'npm-package-arg',
          version: '8.0.1',
        }
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryVersion);
      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'version')
          assert.equal(actual.resolved.name, testRequest.package.name)
        })
    },

    'returns a registry alias package': async () => {
      const testRequest: any = {
        clientData: {
          provider: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'aliased',
          version: 'npm:pacote@11.1.9',
        }
      }

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryAlias);
      const cut = new PacoteClient(new NpmConfig(defaultConfigMock), 0, new LoggerMock());
      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'alias')
          assert.equal(actual.requested.name, testRequest.package.name)
          assert.equal(actual.resolved.name, 'pacote')
          assert.deepEqual(actual.requested, testRequest.package)
        })
    },

  }

}