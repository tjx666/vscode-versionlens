import Fixtures from './fixtures/nugetResources'

import { NuGetResourceClient } from 'providers/dotnet/clients/nugetResourceClient';
import { UrlHelpers } from '/core/clients';
import { DotNetConfig } from 'providers/dotnet/dotnetConfig';
import { LoggerMock } from 'test/unit/mocks/loggerMock'
import { VersionLensExtension } from '/presentation/extension';
import { IConfig } from '/core/configuration';

const assert = require('assert');
const mock = require('mock-require');

let defaultExtensionMock: VersionLensExtension;

export const NuGetResourceClientTests = {

  beforeEach: () => {

    defaultExtensionMock = new VersionLensExtension(<IConfig>{
      get: (k) => undefined
    });

  },

  //  reset mocks
  afterEach: () => mock.stop('request-light'),

  "fetchResource": {

    "returns the autocomplete resource from a list of resources": async () => {
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

      const expected = 'https://unit-test-usnc.nuget.org/autocomplete';

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

    "returns first feed entry from config when fails to obtain a resource": async () => {

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

      const expected = 'https://unit-test-fallback.nuget.org/autocomplete';

      mock('request-light', { xhr: () => Promise.reject(mockResponse) })

      // setup test feeds
      const config = new DotNetConfig(
        new VersionLensExtension(<IConfig>{
          get: (k) => <any>[expected]
        })
      )

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

      const expected = "Could not obtain a nuget resource";

      mock('request-light', { xhr: () => Promise.reject(mockResponse) })

      // setup test feeds
      const config = new DotNetConfig(
        new VersionLensExtension(<IConfig>{
          get: (k) => <any>[]
        })
      )

      const cut = new NuGetResourceClient(config, new LoggerMock())
      return cut.fetchResource(testSource)
        .catch(err => {
          assert.equal(err, expected)
        });
    },

  }

}