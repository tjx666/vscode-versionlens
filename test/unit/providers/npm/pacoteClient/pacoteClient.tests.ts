import { testPath } from 'test/unit/utils';
import { PacoteClient } from 'providers/npm/clients/pacoteClient'
import Fixtures from './pacoteClient.fixtures'
import { NpmConfig } from '/providers/npm/config';
import { LoggerMock } from 'test/unit/mocks/loggerMock';
import { VersionLensExtension } from '/presentation/extension';
import { IConfig } from '/core/configuration';

const assert = require('assert')
const path = require('path')
const mock = require('mock-require')
const npa = require('npm-package-arg');

let pacoteMock = null
let defaultExtensionMock: VersionLensExtension;

export default {

  beforeAll: () => {
    pacoteMock = {
      packument: {}
    }

    mock('pacote', pacoteMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    // mock defaults
    pacoteMock.packument = (npaResult, opts) => { }

    defaultExtensionMock = new VersionLensExtension(<IConfig>{
      get: (k) => undefined
    });
  },

  'fetchPackage': {

    'uses npmrc registry': async () => {
      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
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

      const cut = new PacoteClient(
        new NpmConfig(defaultExtensionMock),
        0,
        new LoggerMock()
      );

      const npaSpec = npa.resolve(
        testRequest.package.name,
        testRequest.package.version,
        testRequest.package.path
      );

      return cut.fetchPackage(testRequest, npaSpec);
    },

    'returns a registry range package': async () => {

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'pacote',
          version: '10.1.*',
        }
      }

      const npaSpec = npa.resolve(
        testRequest.package.name,
        testRequest.package.version,
        testRequest.package.path
      );

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryRange);
      const cut = new PacoteClient(
        new NpmConfig(defaultExtensionMock),
        0,
        new LoggerMock()
      );
      return cut.fetchPackage(testRequest, npaSpec)
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
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'npm-package-arg',
          version: '8.0.1',
        }
      }

      const npaSpec = npa.resolve(
        testRequest.package.name,
        testRequest.package.version,
        testRequest.package.path
      );

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryVersion);
      const cut = new PacoteClient(
        new NpmConfig(defaultExtensionMock),
        0,
        new LoggerMock()
      );
      return cut.fetchPackage(testRequest, npaSpec)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'version')
          assert.equal(actual.resolved.name, testRequest.package.name)
        })
    },

    'returns a registry alias package': async () => {
      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'aliased',
          version: 'npm:pacote@11.1.9',
        }
      }

      const npaSpec = npa.resolve(
        testRequest.package.name,
        testRequest.package.version,
        testRequest.package.path
      );

      // setup initial call
      pacoteMock.packument = (npaResult, opts) => Promise.resolve(Fixtures.packumentRegistryAlias);
      const cut = new PacoteClient(
        new NpmConfig(defaultExtensionMock),
        0,
        new LoggerMock()
      );
      return cut.fetchPackage(testRequest, npaSpec)
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