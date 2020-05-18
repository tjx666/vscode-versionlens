// import { testPath } from 'test/unit/utils';
import { NpmConfig } from '/providers/npm/config';
import { LoggerMock } from 'test/unit/mocks/loggerMock';
import { VersionLensExtension } from '/presentation/extension';
import { IConfig } from '/core/configuration';
import { ClientResponseSource } from '/core/clients';
import { NpmPackageClient } from '/providers/npm/clients/npmPackageClient';
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

    }


  }



}