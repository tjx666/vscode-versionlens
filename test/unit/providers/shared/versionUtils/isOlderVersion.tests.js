import { isOlderVersion } from 'providers/shared/versionUtils';

const assert = require('assert');

export default {

  "Reports true for older versions and false for newer versions": () => {

    const older = [
      '1.2.2',
      '1.2.2',
      '1.0.0-beta.1',
      '1.0.0-beta.1'
    ];

    const newer = [
      '1.2.3',
      '1.2.3-beta.1',
      '1.0.1',
      '1.0.0-beta.2'
    ];

    older.forEach((olderVersion, index) => {
      const newerVersion = newer[index];
      assert.ok(
        isOlderVersion(olderVersion, newerVersion),
        `${olderVersion} should be older than ${newerVersion}`
      );
    })

    older.forEach((olderVersion, index) => {
      const newerVersion = newer[index];
      assert.ok(
        isOlderVersion(newerVersion, olderVersion) === false,
        `${newerVersion} should be newer than ${olderVersion}`
      );
    })

  },

  "Prerelease is older than released versions": () => {
    const olderVersion = '1.2.2-beta.1';
    const newerVersion = '1.2.2';

    assert.ok(
      isOlderVersion(olderVersion, newerVersion),
      `${olderVersion} should be older than ${newerVersion}`
    );

    assert.ok(
      isOlderVersion(newerVersion, olderVersion) === false,
      `${newerVersion} should be newer than ${olderVersion}`
    );

  }

}