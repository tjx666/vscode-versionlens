import { DotNetClient } from 'providers/dotnet/clients/dotnetClient';
import Fixutres from './fixtures/sources'
import {
  ClientResponseSource,
  UrlHelpers
} from '/core/clients';

import { DotNetConfig } from '/providers/dotnet/config';
import { ConfigurationMock } from 'test/unit/mocks/configurationMock'

const assert = require('assert');
const mock = require('mock-require');


let defaultConfigurationMock: ConfigurationMock;

export const DotnetClientRequestTests = {

  beforeEach: () => {

    defaultConfigurationMock = new ConfigurationMock({
      get: (k, d) => d
    });
  },

  // reset all require mocks
  afterEach: () => mock.stop('@npmcli/promise-spawn'),

  "fetchDotnetSources": {

    "returns an Array<DotNetSource> of enabled sources": async () => {
      const testFeeds = [
        'https://test.feed/v3/index.json'
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
          machineWide: true,
          url: 'C:\\Program Files (x86)\\Microsoft SDKs\\NuGetPackages\\',
          protocol: UrlHelpers.RegistryProtocols.file
        },
      ]

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: Fixutres.enabledSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      // setup test feeds
      const config = new DotNetConfig(
        new ConfigurationMock({
          get: (k, d) => testFeeds
        })
      )

      const cut = new DotNetClient(config, 0);
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
          stdout: Fixutres.disabledSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      // setup test feeds
      const config = new DotNetConfig(
        new ConfigurationMock({
          get: (k, d) => testFeeds
        })
      )

      const cut = new DotNetClient(config, 0);
      return cut.fetchSources('.')
        .then(actualSources => {
          assert.equal(actualSources.length, 0);
        });
    },

    "rejects on error output": async () => {

      const expectedErrorResp = {
        source: ClientResponseSource.local,
        status: 'ENOENT',
        data: Fixutres.invalidSources,
      }

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: expectedErrorResp.status,
          stdout: Fixutres.invalidSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      const cut = new DotNetClient(new DotNetConfig(defaultConfigurationMock), 0);
      return cut.fetchSources('.')
        .catch(actualError => {
          assert.deepEqual(actualError, expectedErrorResp);
        });
    },



  }

}