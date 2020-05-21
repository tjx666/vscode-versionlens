import { VsCodeConfig } from 'infrastructure/configuration'

const assert = require('assert')
const mock = require('mock-require')

let vsCodeMock = {
  workspace: {}
};

export const VsCodeFrozenConfigTests = {

  beforeAll: () => {
    // mock require modules
    vsCodeMock = {
      workspace: {
        getConfiguration: (section) => null
      }
    }

    mock('vscode', vsCodeMock)
  },

  afterAll: () => mock.stopAll(),

  "get": {

    "accesses frozen repo after first call": () => {
      const testKey = 'some_property';
      let expectedFrozenValue = 'test value';

      vsCodeMock.workspace = {
        getConfiguration: section => ({ get: k => expectedFrozenValue }),
      }

      // get hot value
      const cut = new VsCodeConfig('testsection');
      const first = cut.get(testKey);
      assert.equal(first, expectedFrozenValue)

      // change expected hot value
      const hotValue = 'hot value';
      vsCodeMock.workspace = {
        getConfiguration: section => ({ get: k => hotValue }),
      }

      // should still return frozen value
      const actualFrozen = cut.get(testKey);

      assert.equal(actualFrozen, expectedFrozenValue)
    },

    "returns hot value after defrost is called": () => {
      const testKey = 'some_property';
      let initialValue = 'test value';

      vsCodeMock.workspace = {
        getConfiguration: section => ({ get: k => initialValue }),
      }

      // get hot value
      const cut = new VsCodeConfig('testsection');
      const first = cut.get(testKey);
      assert.equal(first, initialValue)

      // change expected hot value
      const expectedHotValue = 'hot value';
      vsCodeMock.workspace = {
        getConfiguration: section => ({ get: k => expectedHotValue }),
      }
      // should still return frozen value
      cut.defrost();
      const actualFrozen = cut.get(testKey);

      assert.equal(actualFrozen, expectedHotValue)
    }

  }

}