import { NpmPackageClient, NpmConfig } from 'infrastructure.providers/npm';
import { LoggerMock } from 'infrastructure.testing';
import { VersionLensExtension } from 'presentation.extension';
import { ClientResponseSource } from 'core.clients';
import { PackageSuggestionFlags } from 'core.packages';

const assert = require('assert')
const mock = require('mock-require')

let defaultExtensionMock: VersionLensExtension;
let requestLightMock = null

export default {

  beforeAll: () => {
    // mock require modules
    requestLightMock = {}
    mock('request-light', requestLightMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    defaultExtensionMock = new VersionLensExtension(
      {
        get: (k) => null,
        defrost: () => null
      },
      null
    );
  },

  'fetchGitPackage': {

    'returns fixed package for git:// requests': async () => {

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'core.js',
          version: 'git+https://git@github.com/testuser/test.git',
        }
      };

      requestLightMock.xhr = options => {
        return Promise.resolve({
          status: 200,
          responseText: "",
          source: ClientResponseSource.remote
        })
      };

      // setup initial call
      const cut = new NpmPackageClient(
        new NpmConfig(defaultExtensionMock),
        new LoggerMock()
      );

      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.equal(actual.source, 'git')
          assert.equal(actual.resolved, null)
          assert.deepEqual(actual.requested, testRequest.package)

          assert.deepEqual(
            actual.suggestions,
            [
              {
                name: 'fixed',
                version: 'git repository',
                flags: PackageSuggestionFlags.status
              }
            ]
          )

        })

    },

    'returns unsupported suggestion when not github': async () => {

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        package: {
          path: 'packagepath',
          name: 'core.js',
          version: 'git+https://git@not-gihub.com/testuser/test.git',
        }
      };

      // setup initial call
      const cut = new NpmPackageClient(
        new NpmConfig(defaultExtensionMock),
        new LoggerMock()
      );

      return cut.fetchPackage(testRequest)
        .then((actual) => {
          assert.deepEqual(
            actual.suggestions,
            [
              {
                name: 'not supported',
                version: '',
                flags: PackageSuggestionFlags.status
              }
            ]
          )
        })

    }

  }



}