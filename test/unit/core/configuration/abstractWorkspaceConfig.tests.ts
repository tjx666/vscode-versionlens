import {
  AbstractWorkspaceConfig, IConfig,
} from 'core/configuration'

const assert = require('assert')

export const AbstractWorkspaceConfigTests = {

  "getOrDefault": {

    "returns defined value when key exists": () => {
      const testKey = 'some_extension.key';
      const expectedValue = 'test value';

      const testClass = class Config extends AbstractWorkspaceConfig { }

      const cot = new testClass(<IConfig>{
        get: k => k === testKey ? <any>expectedValue : undefined,
      })

      const actual = cot.getOrDefault(testKey, undefined);
      assert.equal(actual, expectedValue)
    },

    "returns default value when key doesn't exist": () => {
      const testKey = 'some_extension.key';
      const expectedValue = 'test value';

      const testClass = class Config extends AbstractWorkspaceConfig { }

      const cot = new testClass(<IConfig>{
        get: k => undefined,
      })

      const actual = cot.getOrDefault(testKey, expectedValue);
      assert.equal(actual, expectedValue)
    },

  },

};