import Fixtures from './fixtures/dotnetSources'

import { DotNetClient } from 'infrastructure/providers/dotnet/clients/dotnetClient';

import {
  ClientResponseSource,
  UrlHelpers
} from '/core/clients';

import { DotNetConfig } from 'infrastructure/providers/dotnet/dotnetConfig';
import { LoggerMock } from 'test/unit/mocks/loggerMock';
import { VersionLensExtension } from '/presentation/extension';

const assert = require('assert');
const mock = require('mock-require');

let defaultExtensionMock: VersionLensExtension;

export const DotnetClientRequestTests = {

  beforeEach: () => {

    defaultExtensionMock = new VersionLensExtension(
      {
        get: (k) => null,
        defrost: () => null
      }
    );

  },

  // reset all require mocks
  afterEach: () => mock.stop('@npmcli/promise-spawn'),

  "fetchSources": {

    "returns an Array<DotNetSource> of enabled sources": async () => {
      const testFeeds = [
        'https://test.feed/v3/index.json',
      ];

      const expected = [
        {
          enabled: true,
          machineWide: false,
          url: testFeeds[0],
          protocol: UrlHelpers.RegistryProtocols.https
        },
        {
          enabled: true,
          machineWide: false,
          url: 'https://api.nuget.org/v3/index.json',
          protocol: UrlHelpers.RegistryProtocols.https
        },
        {
          enabled: true,
          machineWide: false,
          url: 'http://selfsigned/v3/index.json',
          protocol: UrlHelpers.RegistryProtocols.http
        },
        {
          enabled: true,
          machineWide: true,
          url: 'C:\\Program Files (x86)\\Microsoft SDKs\\NuGetPackages\\',
          protocol: UrlHelpers.RegistryProtocols.file
        },
      ]

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: Fixtures.enabledSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      // setup test feeds
      const config = new DotNetConfig(
        new VersionLensExtension(
          {
            get: (k) => <any>testFeeds,
            defrost: () => null
          }
        )
      )

      const cut = new DotNetClient(config, new LoggerMock());
      return cut.fetchSources('.')
        .then(actualSources => {
          assert.deepEqual(actualSources, expected);
        });

    },

    "return 0 items when no sources are enabled": async () => {
      const testFeeds = [];

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: Fixtures.disabledSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      // setup test feeds
      const config = new DotNetConfig(
        new VersionLensExtension(
          {
            get: (k) => <any>testFeeds,
            defrost: () => null
          }
        )
      )

      const cut = new DotNetClient(config, new LoggerMock());
      return cut.fetchSources('.')
        .then(actualSources => {
          assert.equal(actualSources.length, 0);
        });
    },

    "rejects on error output": async () => {

      const expectedErrorResp = {
        source: ClientResponseSource.local,
        status: '0',
        data: Fixtures.invalidSources,
        rejected: false,
      }

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: expectedErrorResp.status,
          stdout: Fixtures.invalidSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      const cut = new DotNetClient(
        new DotNetConfig(defaultExtensionMock),
        new LoggerMock()
      );

      return cut.fetchSources('.')
        .catch(actualError => {
          assert.deepEqual(actualError, expectedErrorResp);
        });
    },



  }

}