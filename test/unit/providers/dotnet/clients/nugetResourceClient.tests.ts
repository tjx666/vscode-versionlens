import Fixtures from './fixtures/nugetResources'

import { NuGetResourceClient } from 'infrastructure/providers/dotnet/clients/nugetResourceClient';
import { UrlHelpers } from '/core/clients';
import { DotNetConfig } from 'infrastructure/providers/dotnet/dotnetConfig';
import { LoggerMock } from 'test/unit/mocks/loggerMock'
import { VersionLensExtension } from '/presentation/extension';

const assert = require('assert');
const mock = require('mock-require');

let defaultExtensionMock: VersionLensExtension;

export const NuGetResourceClientTests = {

  beforeEach: () => {

    defaultExtensionMock = new VersionLensExtension({
      get: (k) => null,
      defrost: () => null
    });

  },

  //  reset mocks
  afterEach: () => mock.stop('request-light'),

  "fetchResource": {

    "returns the package resource from a list of resources": async () => {
      const testSource = {
        enabled: true,
        machineWide: false,
        url: 'https://test',
        protocol: UrlHelpers.RegistryProtocols.https
      };

      const mockResponse = {
        status: 200,
        responseText: JSON.stringify(Fixtures.success),
      };

      const expected = 'https://api.nuget.org/v3-flatcontainer1/';

      mock('request-light', {
        xhr: options => {
          assert.equal(options.url, testSource.url)
          return Promise.resolve(mockResponse)
        }
      })

      // setup test feeds
      const config = new DotNetConfig(defaultExtensionMock)

      const cut = new NuGetResourceClient(config, new LoggerMock())

      return cut.fetchResource(testSource)
        .then(actualSources => {
          assert.equal(actualSources, expected)
        });
    },

    "throws an error when no resource or feeds can be obtained": async () => {

      const testSource = {
        enabled: true,
        machineWide: false,
        url: 'https://test',
        protocol: UrlHelpers.RegistryProtocols.https
      };

      const mockResponse = {
        status: 404,
        responseText: 'an error occurred',
      };

      const expectedResponse = {
        source: 'remote',
        status: 404,
        data: 'an error occurred',
        rejected: true
      };

      mock('request-light', { xhr: () => Promise.reject(mockResponse) })

      // setup test feeds
      const config = new DotNetConfig(
        new VersionLensExtension({
          get: (k) => <any>[],
          defrost: () => null
        })
      )

      const cut = new NuGetResourceClient(config, new LoggerMock())
      await cut.fetchResource(testSource)
        .catch(err => {
          assert.deepEqual(err, expectedResponse)
        });
    },

  }

}