// import { testPath } from 'test/unit/utils';
import { NpmPackageClient } from 'providers/npm/clients/npmPackageClient'
import { githubFixtures } from './fetchGithub.fixtures'
import { NpmConfig } from '/providers/npm/config';
import { LoggerMock } from 'test/unit/mocks/loggerMock';
import { VersionLensExtension } from '/presentation/extension';
import { IConfig } from '/core/configuration';
import { ClientResponseSource } from '/core/clients';
import { PackageSuggestionFlags } from '/core/packages';

const assert = require('assert')
const mock = require('mock-require')

let defaultExtensionMock: VersionLensExtension;
let requestLightMock = null
let testContext = null

export default {

  beforeAll: () => {
    testContext = {}
    // mock require modules
    requestLightMock = {}
    mock('request-light', requestLightMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    defaultExtensionMock = new VersionLensExtension(<IConfig>{
      get: (k) => undefined
    });
  },

  'fetchGithubPackage': {

    'returns a #semver:x.x.x. package': async () => {

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'core.js',
          version: 'github:octokit/core.js#semver:^2',
        }
      };

      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: JSON.stringify(githubFixtures.tags),
          source: ClientResponseSource.remote
        })
      };

      // setup initial call
      const cut = new NpmPackageClient(
        new NpmConfig(defaultExtensionMock),
        0,
        new LoggerMock()
      );

      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'github')
          assert.equal(actual.type, 'range')
          assert.equal(actual.resolved.name, testRequest.package.name)
          assert.deepEqual(actual.requested, testRequest.package)

          assert.deepEqual(
            actual.suggestions,
            [{
              name: 'satisfies',
              version: 'latest',
              flags: PackageSuggestionFlags.status
            }, {
              name: 'latest',
              version: 'v2.5.0',
              flags: PackageSuggestionFlags.release
            }, {
              name: 'rc',
              version: 'v2.6.0-rc.1',
              flags: PackageSuggestionFlags.prerelease
            }, {
              name: 'preview',
              version: 'v2.5.0-preview.1',
              flags: PackageSuggestionFlags.prerelease
            }]
          )
        })
    },

    'returns a #x.x.x': async () => {

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'core.js',
          version: 'github:octokit/core.js#v2.0.0',
        }
      };

      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: JSON.stringify(githubFixtures.tags),
          source: ClientResponseSource.remote
        })
      };

      // setup initial call
      const cut = new NpmPackageClient(
        new NpmConfig(defaultExtensionMock),
        0,
        new LoggerMock()
      );

      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'github')
          assert.equal(actual.type, 'range')
          assert.equal(actual.provider, testRequest.clientData.providerName)
          assert.equal(actual.resolved.name, testRequest.package.name)
          assert.deepEqual(actual.requested, testRequest.package)

          assert.deepEqual(
            actual.suggestions,
            [{
              name: 'fixed',
              version: 'v2.0.0',
              flags: PackageSuggestionFlags.status
            }, {
              name: 'latest',
              version: 'v2.5.0',
              flags: PackageSuggestionFlags.release
            }]
          )
        })
    },

    'returns a #sha commit': async () => {

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'core.js',
          version: 'github:octokit/core.js#166c3497',
        }
      };

      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: JSON.stringify(githubFixtures.commits),
          source: ClientResponseSource.remote
        })
      };

      // setup initial call
      const cut = new NpmPackageClient(
        new NpmConfig(defaultExtensionMock),
        0,
        new LoggerMock()
      );

      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'github')
          assert.equal(actual.type, 'committish')
          assert.equal(actual.provider, testRequest.clientData.providerName)
          assert.equal(actual.resolved.name, testRequest.package.name)
          assert.deepEqual(actual.requested, testRequest.package)

          assert.deepEqual(
            actual.suggestions,
            [{
              name: 'fixed',
              version: '166c3497',
              flags: PackageSuggestionFlags.status
            }, {
              name: 'latest',
              version: 'df4d9435',
              flags: PackageSuggestionFlags.release
            }]
          )
        })
    }

  }

}