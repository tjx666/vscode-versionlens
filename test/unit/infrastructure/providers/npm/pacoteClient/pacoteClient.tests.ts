import { PacoteClient } from 'infrastructure/providers/npm/clients/pacoteClient'
import Fixtures from './pacoteClient.fixtures'
import { NpmConfig } from 'infrastructure/providers/npm/npmConfig';
import { LoggerMock } from 'test/unit/mocks/loggerMock';
import { VersionLensExtension } from '/presentation/extension';
import { PackageSuggestionFlags } from '/core/packages';

const assert = require('assert')
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

    defaultExtensionMock = new VersionLensExtension(
      {
        get: (k) => null,
        defrost: () => null
      },
      null
    );
  },

  'fetchPackage': {

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
        new LoggerMock()
      );
      return cut.fetchPackage(testRequest, npaSpec)
        .then((actual) => {
          assert.equal(actual.source, 'registry')
          assert.equal(actual.type, 'version')
          assert.equal(actual.resolved.name, testRequest.package.name)
        })
    },

    'returns capped latest versions': async () => {

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'npm-package-arg',
          version: '7.0.0',
        }
      }

      const npaSpec = npa.resolve(
        testRequest.package.name,
        testRequest.package.version,
        testRequest.package.path
      );

      // setup initial call
      pacoteMock.packument = (npaResult, opts) =>
        Promise.resolve(Fixtures.packumentCappedToLatestTaggedVersion);

      const cut = new PacoteClient(
        new NpmConfig(defaultExtensionMock),
        new LoggerMock()
      );
      return cut.fetchPackage(testRequest, npaSpec)
        .then((actual) => {
          assert.deepEqual(actual.suggestions, [{
            name: 'latest',
            version: '',
            flags: PackageSuggestionFlags.status
          }])
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