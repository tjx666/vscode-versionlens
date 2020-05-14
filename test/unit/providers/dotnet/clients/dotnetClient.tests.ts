import { DotNetClient } from 'providers/dotnet/clients/dotnetClient';
import Fixutres from './fixtures/sources'
import { ClientResponseSource } from '/core/clients';
import { DotNetConfig } from '/providers/dotnet/config';

const assert = require('assert');

const mock = require('mock-require');

export const DotnetClientRequestTests = {

  // reset all require mocks
  afterEach: () => mock.stop('@npmcli/promise-spawn'),

  "fetchDotnetSources": {

    "returns an Array<DotNetSource> of enabled sources": async () => {

      const expected = [
        {
          enabled: true,
          machineWide: false,
          source: 'https://api.nuget.org/v3/index.json',
          protocol: 'https:'
        },
        {
          enabled: true,
          machineWide: true,
          source: 'C:\\Program Files (x86)\\Microsoft SDKs\\NuGetPackages\\',
          protocol: 'file:'
        },
      ]

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: Fixutres.enabledSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      const cut = new DotNetClient(new DotNetConfig(), 0);
      return cut.fetchSources('.')
        .then(actualSources => {
          assert.deepEqual(actualSources, expected);
        });

    },


    "return 0 items when no sources are enabled": async () => {

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: Fixutres.disabledSources
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      const cut = new DotNetClient(new DotNetConfig(), 0);
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

      const cut = new DotNetClient(new DotNetConfig(), 0);
      return cut.fetchSources('.')
        .catch(actualError => {
          assert.deepEqual(actualError, expectedErrorResp);
        });
    }

  }

}