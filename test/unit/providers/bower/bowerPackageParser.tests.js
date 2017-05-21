/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { bowerPackageParser } from '../../../../src/providers/bower/bowerPackageParser';

describe('bowerPackageParser(node, appConfig)', () => {
  const githubTaggedCommits = ['Release', 'Tag'];
  const appConfigMock = {
    get githubTaggedCommits() {
      return githubTaggedCommits;
    }
  };

  it('returns the expected object for semver versions', () => {
    let name = 'jquery-mousewheel';
    let version = '3.1.12';

    let result = bowerPackageParser(name, version, appConfigMock);
    assert.equal(result.name, 'jquery-mousewheel', "Expected packageName");
    assert.equal(result.version, '3.1.12', "Expected packageName");
    assert.equal(result.meta.type, 'bower', "Expected meta.type");
    assert.ok(!result.meta.tag.isInvalid, "Expected meta.tag.isInvalid");
    assert.equal(result.customGenerateVersion, null, "Expected customGenerateVersion");
  });

  it('returns the expected object for github versions', () => {
    let name = 'masonry';
    let version = 'desandro/masonry#^4.1.1';

    let results = bowerPackageParser(name, version, appConfigMock);
    results.forEach((result, index) => {
      assert.equal(result.name, 'masonry', "Expected packageName");
      assert.equal(result.version, 'desandro/masonry#^4.1.1', "Expected packageName");
      assert.equal(result.meta.category, githubTaggedCommits[index], "Expected meta.category");
      assert.equal(result.meta.type, 'github', "Expected meta.type");
      assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
      assert.equal(result.meta.userRepo, 'desandro/masonry', "Expected meta.userRepo");
      assert.equal(result.meta.commitish, '^4.1.1', "Expected meta.commitish");
      assert.ok(!!result.customGenerateVersion, "Expected customGenerateVersion");
    })

  });

});