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

  it('returns the expected object for non ranged semver versions', () => {
    let nodeMock = {
      name: 'bootstrap',
      value: '1.2.3'
    };

    let results = npmVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].package.name, 'bootstrap', "Expected packageName");
    assert.equal(results[0].package.version, '1.2.3', "Expected packageVersion");
    assert.equal(results[0].package.meta.type, 'npm', "Expected meta.type");
    assert.ok(!!results[0].package.isValidSemver, "Expected isValidSemver");
    assert.ok(!results[0].package.hasRangeSymbol, "Expected hasRangeSymbol");
    assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for ranged semver versions', () => {
    let nodeMock = {
      name: 'bootstrap',
      value: '~1.2.3'
    };

    let results = npmVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].package.name, 'bootstrap', "Expected packageName");
    assert.equal(results[0].package.version, '~1.2.3', "Expected packageVersion");
    assert.equal(results[0].package.meta.type, 'npm', "Expected meta.type");
    assert.ok(!!results[0].package.isValidSemver, "Expected isValidSemver");
    assert.ok(results[0].package.hasRangeSymbol, "Expected hasRangeSymbol");
    assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for file versions', () => {
    let nodeMock = {
      name: 'another-project',
      value: 'file:../another-project'
    };

    let results = npmVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].package.name, 'another-project', "Expected packageName");
    assert.equal(results[0].package.version, 'file:../another-project', "Expected packageName");
    assert.equal(results[0].package.meta.type, 'file', "Expected meta.type");
    assert.equal(results[0].package.meta.remoteUrl, '../another-project', "Expected meta.remoteUrl");
    assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for github versions', () => {
    let nodeMock = {
      name: 'bootstrap',
      value: 'twbs/bootstrap#v10.2.3-alpha'
    };

    let results = npmVersionParser(nodeMock, appConfigMock);
    results.forEach((result, index) => {
      assert.equal(result.package.name, 'bootstrap', "Expected packageName");
      assert.equal(result.package.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
      assert.equal(result.package.meta.category, githubCompareOptions[index], "Expected meta.category");
      assert.equal(result.package.meta.type, 'github', "Expected meta.type");
      assert.equal(result.package.meta.remoteUrl, `https://github.com/${result.package.meta.userRepo}/commit/${result.package.meta.commitish}`, "Expected meta.remoteUrl");
      assert.equal(result.package.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
      assert.equal(result.package.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
      assert.ok(!!result.package.customGenerateVersion, "Expected package.customGenerateVersion");
    });

  });

  it('customGenerateVersion preserves leading range symbol for github semver tags', () => {
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

  it('customGenerateVersion ignores leading range symbol for github commit sha', () => {
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