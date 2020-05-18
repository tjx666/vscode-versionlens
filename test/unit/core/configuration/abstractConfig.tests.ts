import { AbstractConfig, IConfig, } from 'core/configuration'

const assert = require('assert')

const TestClass = class Config extends AbstractConfig {
  constructor(rootKey: string, config, defaultKey?: string) {
    super(rootKey, config, defaultKey);
  }
}

export const AbstractConfigTests = {

  "get": {

    "returns values using key levels": () => {
      const rootKey = 'root';
      const testKey = 'some_property';
      const expectedKey = `${rootKey}.${testKey}`;
      const expectedValue = 'test value';

      const cot = new TestClass(
        rootKey,
        {
          get: k => k === expectedKey ? <any>expectedValue : null
        }
      );

      const actual = cot.get(testKey);
      assert.equal(actual, expectedValue)
    }

  },

  "getOrDefault": {

    "returns key value": () => {
      const rootKey = 'root';
      const testKey = 'some_property';
      const expectedKey = `${rootKey}.${testKey}`;
      const expectedValue = 'test value';
      const cot = new TestClass(
        rootKey,
        {
          get: k => k === expectedKey ? expectedValue : null
        }
      );

      const actual = cot.getOrDefault(testKey, null);
      assert.equal(actual, expectedValue)
    },

    "returns default key value": () => {
      const rootKey = 'root';
      const testKey = 'property_key';
      const defaultKey = 'default_key';
      const expectedKey = `${defaultKey}.${testKey}`;
      const expectedValue = 'test value';

      const cot = new TestClass(
        rootKey,
        {
          get: k => k === expectedKey ? expectedValue : null
        },
        defaultKey
      );

      const actual = cot.getOrDefault(testKey, null);
      assert.equal(actual, expectedValue)
    },

    "returns default arg value": () => {
      const rootKey = 'root';
      const testKey = 'some_key';
      const defaultKey = 'some_default_key';
      const expectedValue = 'test value';

      const cot = new TestClass(
        rootKey,
        {
          get: k => null
        },
        defaultKey
      );

      const actual = cot.getOrDefault(testKey, expectedValue);
      assert.equal(actual, expectedValue)
    },

  }

}