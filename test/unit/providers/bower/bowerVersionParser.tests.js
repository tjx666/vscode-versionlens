/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { register, clear } from '../../../../src/common/di';
import { bowerVersionParser } from '../../../../src/providers/bower/bowerVersionParser';

describe('bowerVersionParser(node, appConfig)', () => {
  const githubCompareOptions = ['Release', 'Tag', 'Commit'];
  const appConfigMock = {};
  Object.defineProperty(appConfigMock, 'githubCompareOptions', { get: () => githubCompareOptions })

  beforeEach(() => {
    clear();
    register('appConfig', appConfigMock);
  });

  it('returns the expected object for semver versions', () => {
    let nodeMock = {
      value: {
        location: 'jquery-mousewheel',
        value: '3.1.12'
      }
    };

    let results = bowerVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].packageName, 'jquery-mousewheel', "Expected packageName");
    assert.equal(results[0].packageVersion, '3.1.12', "Expected packageName");
    assert.equal(results[0].meta.type, 'bower', "Expected meta.type");
    assert.ok(!!results[0].isValidSemver, "Expected isValidSemver");
    assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for github versions', () => {
    let nodeMock = {
      value: {
        location: 'masonry',
        value: 'desandro/masonry#^4.1.1'
      }
    };

    let results = bowerVersionParser(nodeMock, appConfigMock);
    results.forEach((result, index) => {
      assert.equal(result.packageName, 'masonry', "Expected packageName");
      assert.equal(result.packageVersion, 'desandro/masonry#^4.1.1', "Expected packageName");
      assert.equal(result.meta.category, githubCompareOptions[index], "Expected meta.category");
      assert.equal(result.meta.type, 'github', "Expected meta.type");
      assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
      assert.equal(result.meta.userRepo, 'desandro/masonry', "Expected meta.userRepo");
      assert.equal(result.meta.commitish, '^4.1.1', "Expected meta.commitish");
      assert.ok(!!result.customGenerateVersion, "Expected meta.customGenerateVersion");
    })

  });

});