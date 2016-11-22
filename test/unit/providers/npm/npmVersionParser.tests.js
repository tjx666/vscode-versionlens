/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { npmVersionParser, customGenerateVersion } from '../../../../src/providers/npm/npmVersionParser';

describe('npmVersionParser(node, appConfig)', () => {
  const githubCompareOptions = ['Release', 'Tag', 'Commit'];
  const appConfigMock = {
    get githubCompareOptions() {
      return githubCompareOptions;
    }
  };

  it('returns the expected object for semver versions', () => {
    let nodeMock = {
      value: {
        location: 'bootstrap',
        value: '1.2.3'
      }
    };

    let results = npmVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].packageName, 'bootstrap', "Expected packageName");
    assert.equal(results[0].packageVersion, '1.2.3', "Expected packageName");
    assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
    assert.ok(!!results[0].isValidSemver, "Expected isValidSemver");
    assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for file versions', () => {
    let nodeMock = {
      value: {
        location: 'another-project',
        value: 'file:../another-project'
      }
    };

    let results = npmVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].packageName, 'another-project', "Expected packageName");
    assert.equal(results[0].packageVersion, 'file:../another-project', "Expected packageName");
    assert.equal(results[0].meta.type, 'file', "Expected meta.type");
    assert.equal(results[0].meta.remoteUrl, '../another-project', "Expected meta.remoteUrl");
    assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for github versions', () => {
    let nodeMock = {
      value: {
        location: 'bootstrap',
        value: 'twbs/bootstrap#v10.2.3-alpha'
      }
    };

    let results = npmVersionParser(nodeMock, appConfigMock);
    results.forEach((result, index) => {
      assert.equal(result.packageName, 'bootstrap', "Expected packageName");
      assert.equal(result.packageVersion, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
      assert.equal(result.meta.category, githubCompareOptions[index], "Expected meta.category");
      assert.equal(result.meta.type, 'github', "Expected meta.type");
      assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
      assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
      assert.equal(result.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
      assert.ok(!!result.customGenerateVersion, "Expected meta.customGenerateVersion");
    });

  });

  it('customGenerateVersion preserves leading symbol for github semver tags', () => {
    let packageMock = {
      name: 'bootstrap',
      version: 'twbs/bootstrap#^4.0.0-alpha.4',
      meta: {
        type: 'github',
        commitish: '^4.0.0-alpha.4',
        userRepo: 'twbs/bootstrap'
      }
    };

    const newVersion = '4.0.0-alpha.5';
    assert.equal(
      customGenerateVersion(packageMock, newVersion), `twbs/bootstrap#^4.0.0-alpha.5`,
      "Expected customGenerateVersion to return correct version"
    );
  });

  it('customGenerateVersion ignores leading symbol for github commit sha', () => {
    let packageMock = {
      name: 'bootstrap',
      version: 'twbs/bootstrap#^4.0.0-alpha.4',
      meta: {
        type: 'github',
        commitish: '^4.0.0-alpha.4',
        userRepo: 'twbs/bootstrap'
      }
    };

    const newVersion = '5f7a3bc';
    assert.equal(
      customGenerateVersion(packageMock, newVersion), `twbs/bootstrap#5f7a3bc`,
      "Expected customGenerateVersion to return correct version"
    );
  });

});