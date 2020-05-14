import { fetchDotNetSources } from 'providers/dotnet/clients/dotnetClient';

const assert = require('assert');

const mock = require('mock-require');

export const DotnetClientRequestTests = {

  // reset all require mocks
  afterAll: () => mock.stopAll,

  "fetchDotnetSources": {

    "returns an Array<DotnetSource> from output": async () => {

      const expected = [
        {
          enabled: true,
          machineWide: false,
          source: 'https://someapi.example',
          protocol: 'https:'
        },
        {
          enabled: true,
          machineWide: true,
          source: 'c:\\some\\file\\location',
          protocol: 'file:'
        },
      ]

      const testSources = [
        `E ${expected[0].source}\n`,
        `EM ${expected[1].source}\n`,
      ]

      let promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: testSources.join('')
        });
      };

      mock('@npmcli/promise-spawn', promiseSpawnMock);

      return fetchDotNetSources('.')
        .then(result => {
          assert.deepEqual(result, expected);
        });

    }

  }


}