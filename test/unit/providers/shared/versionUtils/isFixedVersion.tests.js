import { isFixedVersion } from 'providers/shared/versionUtils';

const assert = require('assert');

export default {

  "returns true for fixed versions": () => {
    assert.ok(
      isFixedVersion('1.2.3') === true,
      `1.2.3 should be a fixed version`
    );
  },

  "returns false ranged versions": () => {
    const tests = [
      '~1.2.3',
      '>=1.2.3',
      '1.0.*'
    ];

    tests.forEach((testVersion, index) => {
      assert.ok(
        isFixedVersion(testVersion) === false,
        `${testVersion} should not be fixed at ${index}`
      );
    });
  }

}