// import { testPath } from 'test/unit/utils';
import { NpmPackageClient } from 'providers/npm/clients/npmPackageClient'
// import Fixtures from './pacoteClient.fixtures'
import { NpmConfig } from '/providers/npm/config';
import { LoggerMock } from 'test/unit/mocks/loggerMock';
import { VersionLensExtension } from '/presentation/extension';
import { IConfig } from '/core/configuration';

const assert = require('assert')
const mock = require('mock-require')

let defaultExtensionMock: VersionLensExtension;

export default {

  beforeAll: () => { },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    defaultExtensionMock = new VersionLensExtension(<IConfig>{
      get: (k) => undefined
    });
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