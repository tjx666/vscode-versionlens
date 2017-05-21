/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as proxyquire from 'proxyquire';
import * as assert from 'assert';
import * as path from 'path';
import { TestFixtureMap } from '../../../testUtils';

describe('npmPackageParser(node, appConfig)', () => {
  const testPath = path.join(__dirname, '../../../../..', 'test');
  const fixturePath = path.join(testPath, 'fixtures');
  const fixtureMap = new TestFixtureMap(fixturePath);

  const npmAPIMock = {
    npmViewDistTags: function (testPackageName) {
      return Promise.resolve([
        { name: 'latest', version: '1.2.3' },
        { name: 'alpha', version: '1.2.5-alpha.1' },
        { name: 'beta', version: '1.2.5-beta.1' }
      ]);
    }
  }

  const npmPackageParserModule = proxyquire('../../../../src/providers/npm/npmPackageParser', {
    './npmAPI': npmAPIMock
  });

  const githubTaggedCommitsMock = ['Commit', 'Release', 'Tag'];
  const appConfigMock = {
    get githubTaggedCommits() {
      return githubTaggedCommitsMock;
    }
  };

  describe('npmPackageParser', () => {

    it('returns the expected object for non ranged semver versions', done => {
      const name = 'bootstrap';
      const version = '1.2.3';

      const parsedResults = npmPackageParserModule.npmPackageParser(name, version, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].name, 'bootstrap', "Expected packageName");
          assert.equal(results[0].version, '1.2.3', "Expected packageVersion");
          assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
          assert.ok(!results[0].meta.tag.isInvalid, "Expected meta.tag.isInvalid");
          assert.ok(results[0].meta.tag.isFixedVersion, "Expected meta.tag.isFixedVersion to be true");
          assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for ranged semver versions', done => {
      const name = 'bootstrap';
      const version = '~1.2.3';

      const parsedResults = npmPackageParserModule.npmPackageParser(name, version, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].name, 'bootstrap', "Expected packageName");
          assert.equal(results[0].version, '~1.2.3', "Expected packageVersion");
          assert.equal(results[0].meta.type, 'npm', "Expected meta.type");
          assert.ok(!results[0].meta.tag.isInvalid, "Expected meta.tag.isInvalid");
          assert.ok(!results[0].meta.tag.isFixedVersion, "Expected meta.tag.isFixedVersion to be false");
          assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for file versions', done => {
      const name = 'another-project';
      const version = 'file:../another-project';

      const parsedResults = npmPackageParserModule.npmPackageParser(name, version, appConfigMock);
      Promise.resolve(parsedResults)
        .then(result => {
          assert.equal(result.name, 'another-project', "Expected packageName");
          assert.equal(result.version, 'file:../another-project', "Expected packageName");
          assert.equal(result.meta.type, 'file', "Expected meta.type");
          assert.equal(result.meta.remoteUrl, '../another-project', "Expected meta.remoteUrl");
          assert.equal(result.customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for github versions', done => {
      const name = 'bootstrap';
      const version = 'twbs/bootstrap#v10.2.3-alpha';

      const parsedResults = npmPackageParserModule.npmPackageParser(name, version, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          results.forEach((result, index) => {
            assert.equal(result.name, 'bootstrap', "Expected packageName");
            assert.equal(result.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
            assert.equal(result.meta.category, githubTaggedCommitsMock[index], `Expected meta.category ${result.meta.category} == ${githubTaggedCommitsMock[index]}`);
            assert.equal(result.meta.type, 'github', "Expected meta.type");
            assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
            assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
            assert.equal(result.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
            assert.ok(!!result.customGenerateVersion, "Expected package.customGenerateVersion");
          });
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for git+http+github versions', done => {
      const name = 'bootstrap';
      const version = 'git+https://git@github.com/twbs/bootstrap.git#v10.2.3-alpha';

      const parsedResults = npmPackageParserModule.npmPackageParser(name, version, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          results.forEach((result, index) => {
            assert.equal(result.name, 'bootstrap', "Expected packageName");
            assert.equal(result.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
            assert.equal(result.meta.category, githubTaggedCommitsMock[index], `Expected meta.category ${result.meta.category} == ${githubTaggedCommitsMock[index]}`);
            assert.equal(result.meta.type, 'github', "Expected meta.type");
            assert.equal(result.meta.remoteUrl, `https://github.com/${result.meta.userRepo}/commit/${result.meta.commitish}`, "Expected meta.remoteUrl");
            assert.equal(result.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
            assert.equal(result.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
            assert.ok(!!result.customGenerateVersion, "Expected package.customGenerateVersion");
          });
          done();
        })
        .catch(console.log.bind(this));
    });

  });

  describe('customGenerateVersion', () => {

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
        npmPackageParserModule.customNpmGenerateVersion(packageMock, newVersion), `twbs/bootstrap#^4.0.0-alpha.5`,
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
        npmPackageParserModule.customNpmGenerateVersion(packageMock, newVersion), `twbs/bootstrap#5f7a3bc`,
        "Expected customGenerateVersion to return correct version"
      );
    });

  });

});