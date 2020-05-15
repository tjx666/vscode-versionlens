import { ClientResponseSource } from 'core/clients'
import { ProcessClientRequest } from 'infrastructure/clients'

const assert = require('assert')
const mock = require('mock-require')

export const ProcessClientRequestTests = {

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    // reset mocks
    mock.stop('@npmcli/promise-spawn');
  },

  "requestJson": {

    "returns <ProcessClientResponse> when error occurs": async () => {

      const promiseSpawnMock = (cmd, args, opts) => {
        return Promise.reject({
          code: "ENOENT",
          message: "spawn missing ENOENT"
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      const rut = new ProcessClientRequest()
      return await rut.request(
        'missing',
        ['--ooppss'],
        '/'
      ).catch(response => {
        assert.equal(response.status, "ENOENT")
        assert.equal(response.data, "spawn missing ENOENT")
      })

    },

    "returns <ProcessClientResponse> and caches response": async () => {
      const testResponse = {
        source: ClientResponseSource.local,
        status: 0,
        data: '123\n',
      }

      const expectedCacheData = {
        source: ClientResponseSource.cache,
        status: testResponse.status,
        data: testResponse.data,
      }

      const promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: testResponse.data
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      const rut = new ProcessClientRequest()

      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, testResponse)
      })

      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, expectedCacheData)
      })

    },

    "doesn't cache when duration is 0": async () => {
      const testKey = 'echo 123';
      const testResponse = {
        source: ClientResponseSource.local,
        status: 0,
        data: '123\n',
      }

      const promiseSpawnMock = (cmd, args, opts) => {
        return Promise.resolve({
          code: 0,
          stdout: testResponse.data
        });
      };
      mock('@npmcli/promise-spawn', promiseSpawnMock);

      const rut = new ProcessClientRequest(0)
      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, testResponse)
      })

      await rut.request(
        'echo',
        ['123'],
        'd:\\'
      ).then(response => {
        assert.deepEqual(response, testResponse)

        const cachedData = rut.cache.get(testKey);
        assert.equal(cachedData, undefined);
      })

    },

  },

};