/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { bowerVersionParser } from '../../../../src/providers/bower/bowerVersionParser';

describe('bowerVersionParser(node, appConfig)', () => {
  const githubTaggedCommits = ['Release', 'Tag'];
  const appConfigMock = {
    get githubTaggedCommits() {
      return githubTaggedCommits;
    }
  };

  it('returns the expected object for semver versions', () => {
    let nodeMock = {
      name: 'jquery-mousewheel',
      value: '3.1.12'
    };

    let results = bowerVersionParser(nodeMock, appConfigMock);
    assert.equal(results[0].package.name, 'jquery-mousewheel', "Expected packageName");
    assert.equal(results[0].package.version, '3.1.12', "Expected packageName");
    assert.equal(results[0].package.meta.type, 'bower', "Expected meta.type");
    assert.ok(!results[0].package.meta.tag.isInvalid, "Expected meta.tag.isInvalid");
    assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for github versions', () => {
    let nodeMock = {
      name: 'masonry',
      value: 'desandro/masonry#^4.1.1'
    };

    let results = bowerVersionParser(nodeMock, appConfigMock);
    results.forEach((result, index) => {
      assert.equal(result.package.packageName, 'masonry', "Expected packageName");
      assert.equal(result.package.packageVersion, 'desandro/masonry#^4.1.1', "Expected packageName");
      assert.equal(result.package.meta.category, githubTaggedCommits[index], "Expected meta.category");
      assert.equal(result.package.meta.type, 'github', "Expected meta.type");
      assert.equal(result.package.meta.remoteUrl, `https://github.com/${result.package.meta.userRepo}/commit/${result.package.meta.commitish}`, "Expected meta.remoteUrl");
      assert.equal(result.package.meta.userRepo, 'desandro/masonry', "Expected meta.userRepo");
      assert.equal(result.package.meta.commitish, '^4.1.1', "Expected meta.commitish");
      assert.ok(!!result.package.customGenerateVersion, "Expected customGenerateVersion");
    })

  });

});