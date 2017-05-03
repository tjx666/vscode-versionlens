/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { jspmVersionParser, customGenerateVersion } from '../../../../src/providers/jspm/jspmVersionParser';

describe('jspmVersionParser(node, appConfig)', () => {
  const githubCompareOptions
  const appConfigMock

  beforeEach(() => {
    githubCompareOptions = ['Release', 'Tag', 'Commit'];
    appConfigMock = {
      get githubCompareOptions() {
        return githubCompareOptions;
      }
    };
  });

  it('returns the expected object for npm semver versions', () => {
    let nodeMock = {
      name: 'bluebird',
      value: 'npm:bluebird@3.4.6'
    };

    let results = jspmVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].package.name, 'bluebird', "Expected packageName");
    assert.equal(results[0].package.version, '3.4.6', "Expected packageName");
    assert.equal(results[0].package.meta.type, 'npm', "Expected meta.type");
    assert.ok(!!results[0].package.isValidSemver, "Expected isValidSemver");
    assert.ok(!!results[0].package.customGenerateVersion, "Expected customGenerateVersion");
  });

  it('returns the expected object for github versions', () => {
    let nodeMock = {
      name: 'bootstrap',
      value: 'github:twbs/bootstrap@4.0.0-alpha.4'
    };

    let results = jspmVersionParser(nodeMock, appConfigMock);
    results.forEach((result, index) => {
      assert.equal(result.package.name, 'twbs/bootstrap', "Expected packageName");
      assert.equal(result.package.version, 'twbs/bootstrap#4.0.0-alpha.4', "Expected packageName");
      assert.equal(result.package.meta.category, githubCompareOptions[index], "Expected meta.category");
      assert.equal(result.package.meta.type, 'github', "Expected meta.type");
      assert.equal(result.package.meta.remoteUrl, `https://github.com/${result.package.meta.userRepo}/commit/${result.package.meta.commitish}`, "Expected meta.remoteUrl");
      assert.equal(result.package.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
      assert.equal(result.package.meta.commitish, '4.0.0-alpha.4', "Expected meta.commitish");
      assert.ok(!!result.customGenerateVersion, "Expected meta.customGenerateVersion");
    })

  });

  it('customGenerateVersion preserves leading symbol for github semver tags', () => {
    let packageMock = {
      name: 'bootstrap',
      value: 'github:twbs/bootstrap@^4.0.0-alpha.4',
      meta: {
        type: 'github',
        commitish: '^4.0.0-alpha.4'
      }
    };

    const newVersion = '4.0.0-alpha.5';
    assert.equal(
      customGenerateVersion(packageMock, newVersion), `github:bootstrap@^4.0.0-alpha.5`,
      "Expected customGenerateVersion to return correct version"
    );
  });

  it('customGenerateVersion ignores leading symbol for github commit sha', () => {
    let packageMock = {
      name: 'bootstrap',
      version: 'github:twbs/bootstrap@^4.0.0-alpha.4',
      meta: {
        type: 'github',
        commitish: '^4.0.0-alpha.4'
      }
    };

    const newVersion = '5f7a3bc';
    assert.equal(
      customGenerateVersion(packageMock, newVersion), `github:bootstrap@5f7a3bc`,
      "Expected customGenerateVersion to return correct version"
    );
  });

});