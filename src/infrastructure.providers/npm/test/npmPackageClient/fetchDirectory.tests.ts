import { NpmConfig, NpmPackageClient } from 'infrastructure.providers/npm'
import { LoggerMock } from 'infrastructure.testing';
import { VersionLensExtension } from 'presentation.extension';

const assert = require('assert')
const mock = require('mock-require')

let defaultExtensionMock: VersionLensExtension;

export default {

  beforeAll: () => { },

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

    'returns a file:// directory package': async () => {
      const expectedSource = 'directory';

      const testRequest: any = {
        clientData: {
          providerName: 'testnpmprovider',
        },
        source: 'npmtest',
        package: {
          path: 'filepackagepath',
          name: 'filepackage',
          version: 'file://some/path/out/there',
        }
      }

      const cut = new NpmPackageClient(
        new NpmConfig(defaultExtensionMock),
        new LoggerMock()
      );

      return cut.fetchPackage(testRequest)
        .then(actual => {
          assert.equal(actual.source, 'directory', `expected to see ${expectedSource}`)
          assert.deepEqual(actual.requested, testRequest.package)
        })
    }

  }

}