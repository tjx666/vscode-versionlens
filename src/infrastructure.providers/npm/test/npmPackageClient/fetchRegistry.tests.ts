import { NpmConfig, NpmPackageClient } from 'infrastructure.providers/npm'
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

  'fetchPackage': {

    'returns 401, 404 and ECONNREFUSED suggestion statuses': async () => {
      const testRequest: any = {
        providerName: 'testnpmprovider',
        package: {
          path: 'packagepath',
          name: 'private-reg',
          version: '1.2.3',
        }
      };

      const testStates = [
        { status: 401, suggestion: { name: 'not authorized' } },
        { status: 404, suggestion: { name: 'package not found' } },
        { status: 'ECONNREFUSED', suggestion: { name: 'connection refused' } },
      ]

      // setup initial call
      const cut = new NpmPackageClient(
        new NpmConfig(defaultExtensionMock),
        new LoggerMock()
      );

      return testStates.forEach(async testState => {

        requestLightMock.xhr = options => {
          return Promise.resolve({
            status: testState.status,
            responseText: "response",
            source: ClientResponseSource.remote
          })
        };

        await cut.fetchPackage(testRequest)
          .then((actual) => {
            assert.equal(actual.source, 'registry')
            assert.deepEqual(actual.requested, testRequest.package)

            assert.deepEqual(
              actual.suggestions,
              [{
                name: testState.suggestion.name,
                version: '',
                flags: PackageSuggestionFlags.status
              }]
            )
          })

      })

    }

  }

}