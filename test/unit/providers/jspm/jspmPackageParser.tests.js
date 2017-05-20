/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as proxyquire from 'proxyquire';
import * as assert from 'assert';

describe('jspmPackageParser(node, appConfig)', () => {
  const githubTaggedCommitsMock
  const appConfigMock

  const npmAPIMock = {
    npmViewDistTags: function (testPackageName) {
      return Promise.resolve([
        { name: 'latest', version: '1.2.3' },
        { name: 'alpha', version: '1.2.5-alpha.1' },
        { name: 'beta', version: '1.2.5-beta.1' }
      ]);
    }
  };

  const npmPackageParserModule = proxyquire('../../../../src/providers/npm/npmPackageParser', {
    './npmAPI': npmAPIMock
  });

  const jspmPackageParserModule = proxyquire('../../../../src/providers/jspm/jspmPackageParser', {
    '../npm/npmPackageParser': npmPackageParserModule
  });

  beforeEach(() => {
    githubTaggedCommitsMock = ['Commit', 'Release', 'Tag'];
    appConfigMock = {
      get githubTaggedCommits() {
        return githubTaggedCommitsMock;
      }
    };
  });

  it('returns the expected object for npm semver versions', done => {
    let nodeMock = {
      name: 'bluebird',
      value: 'npm:bluebird@3.4.6'
    };

    const parsedResults = jspmPackageParserModule.jspmPackageParser(nodeMock, appConfigMock);
    Promise.resolve(parsedResults)
      .then(results => {
        assert.equal(results[0].package.name, 'bluebird', "Expected packageName");
        assert.equal(results[0].package.version, '3.4.6', "Expected packageName");
        assert.equal(results[0].package.meta.type, 'npm', "Expected meta.type");
        assert.ok(!results[0].package.meta.tagisInvalid, "Expected meta.tag.isInvalid");
        assert.ok(!!results[0].package.customGenerateVersion, "Expected customGenerateVersion");
        done();
      })
      .catch(console.log.bind(this));

  });

  it('returns the expected object for github versions', done => {
    let nodeMock = {
      name: 'bootstrap',
      value: 'github:twbs/bootstrap@4.0.0-alpha.4'
    };

    const parsedResults = jspmPackageParserModule.jspmPackageParser(nodeMock, appConfigMock);
    Promise.resolve(parsedResults)
      .then(results => {
        results.forEach((result, index) => {
          assert.equal(result.package.name, 'twbs/bootstrap', "Expected packageName");
          assert.equal(result.package.version, 'twbs/bootstrap#4.0.0-alpha.4', "Expected packageName");
          assert.equal(result.package.meta.category, githubTaggedCommitsMock[index], `Expected meta.category ${result.package.meta.category} == ${githubTaggedCommitsMock[index]}`);
          assert.equal(result.package.meta.type, 'github', "Expected meta.type");
          assert.equal(result.package.meta.remoteUrl, `https://github.com/${result.package.meta.userRepo}/commit/${result.package.meta.commitish}`, "Expected meta.remoteUrl");
          assert.equal(result.package.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
          assert.equal(result.package.meta.commitish, '4.0.0-alpha.4', "Expected meta.commitish");
          assert.ok(!!result.package.customGenerateVersion, "Expected package.customGenerateVersion");
        });
        done();
      })
      .catch(console.log.bind(this));

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
      jspmPackageParserModule.customJspmGenerateVersion(packageMock, newVersion), `github:bootstrap@^4.0.0-alpha.5`,
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
      jspmPackageParserModule.customJspmGenerateVersion(packageMock, newVersion), `github:bootstrap@5f7a3bc`,
      "Expected customGenerateVersion to return correct version"
    );
  });

});