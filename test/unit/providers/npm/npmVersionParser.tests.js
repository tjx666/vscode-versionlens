/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as proxyquire from 'proxyquire';
import * as assert from 'assert';
import * as path from 'path';
import { TestFixtureMap } from '../../../testUtils';

describe('npmVersionParser(node, appConfig)', () => {
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

  const NpmVersionParserModule = proxyquire('../../../../src/providers/npm/npmVersionParser', {
    './npmAPI': npmAPIMock
  });

  const githubTaggedCommitsMock = ['Commit', 'Release', 'Tag'];
  const appConfigMock = {
    get githubTaggedCommits() {
      return githubTaggedCommitsMock;
    }
  };

  describe('npmVersionParser', () => {

    it('returns the expected object for non ranged semver versions', done => {
      let nodeMock = {
        name: 'bootstrap',
        value: '1.2.3'
      };

      const parsedResults = NpmVersionParserModule.npmVersionParser(nodeMock, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].package.name, 'bootstrap', "Expected packageName");
          assert.equal(results[0].package.version, '1.2.3', "Expected packageVersion");
          assert.equal(results[0].package.meta.type, 'npm', "Expected meta.type");
          assert.ok(!!results[0].package.meta.isValidSemver, "Expected meta.isValidSemver");
          assert.ok(results[0].package.meta.isFixedVersion, "Expected meta.isFixedVersion to be true");
          assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for ranged semver versions', done => {
      let nodeMock = {
        name: 'bootstrap',
        value: '~1.2.3'
      };

      const parsedResults = NpmVersionParserModule.npmVersionParser(nodeMock, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].package.name, 'bootstrap', "Expected packageName");
          assert.equal(results[0].package.version, '~1.2.3', "Expected packageVersion");
          assert.equal(results[0].package.meta.type, 'npm', "Expected meta.type");
          assert.ok(!!results[0].package.meta.isValidSemver, "Expected meta.isValidSemver");
          assert.ok(!results[0].package.meta.isFixedVersion, "Expected meta.isFixedVersion to be false");
          assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for file versions', done => {
      let nodeMock = {
        name: 'another-project',
        value: 'file:../another-project'
      };

      const parsedResults = NpmVersionParserModule.npmVersionParser(nodeMock, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          assert.equal(results[0].package.name, 'another-project', "Expected packageName");
          assert.equal(results[0].package.version, 'file:../another-project', "Expected packageName");
          assert.equal(results[0].package.meta.type, 'file', "Expected meta.type");
          assert.equal(results[0].package.meta.remoteUrl, '../another-project', "Expected meta.remoteUrl");
          assert.equal(results[0].customGenerateVersion, null, "Expected customGenerateVersion");
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for github versions', done => {
      let nodeMock = {
        name: 'bootstrap',
        value: 'twbs/bootstrap#v10.2.3-alpha'
      };

      const parsedResults = NpmVersionParserModule.npmVersionParser(nodeMock, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          results.forEach((result, index) => {
            assert.equal(result.package.name, 'bootstrap', "Expected packageName");
            assert.equal(result.package.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
            assert.equal(result.package.meta.category, githubTaggedCommitsMock[index], `Expected meta.category ${result.package.meta.category} == ${githubTaggedCommitsMock[index]}`);
            assert.equal(result.package.meta.type, 'github', "Expected meta.type");
            assert.equal(result.package.meta.remoteUrl, `https://github.com/${result.package.meta.userRepo}/commit/${result.package.meta.commitish}`, "Expected meta.remoteUrl");
            assert.equal(result.package.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
            assert.equal(result.package.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
            assert.ok(!!result.package.customGenerateVersion, "Expected package.customGenerateVersion");
          });
          done();
        })
        .catch(console.log.bind(this));
    });

    it('returns the expected object for git+http+github versions', done => {
      let nodeMock = {
        name: 'bootstrap',
        value: 'git+https://git@github.com/twbs/bootstrap.git#v10.2.3-alpha'
      };

      const parsedResults = NpmVersionParserModule.npmVersionParser(nodeMock, appConfigMock);
      Promise.resolve(parsedResults)
        .then(results => {
          results.forEach((result, index) => {
            assert.equal(result.package.name, 'bootstrap', "Expected packageName");
            assert.equal(result.package.version, 'twbs/bootstrap#v10.2.3-alpha', "Expected packageName");
            assert.equal(result.package.meta.category, githubTaggedCommitsMock[index], `Expected meta.category ${result.package.meta.category} == ${githubTaggedCommitsMock[index]}`);
            assert.equal(result.package.meta.type, 'github', "Expected meta.type");
            assert.equal(result.package.meta.remoteUrl, `https://github.com/${result.package.meta.userRepo}/commit/${result.package.meta.commitish}`, "Expected meta.remoteUrl");
            assert.equal(result.package.meta.userRepo, 'twbs/bootstrap', "Expected meta.userRepo");
            assert.equal(result.package.meta.commitish, 'v10.2.3-alpha', "Expected meta.commitish");
            assert.ok(!!result.package.customGenerateVersion, "Expected package.customGenerateVersion");
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
        NpmVersionParserModule.customNpmGenerateVersion(packageMock, newVersion), `twbs/bootstrap#^4.0.0-alpha.5`,
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
        NpmVersionParserModule.customNpmGenerateVersion(packageMock, newVersion), `twbs/bootstrap#5f7a3bc`,
        "Expected customGenerateVersion to return correct version"
      );
    });

  });

  describe('extractTagsFromDistTagList', () => {

    it('no "latest" tag entry should exist when requested version is already latest', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = '7.0.18';
      const testSatisfiesVersion = '7.0.18';

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[1].name != 'latest', "Name should not match 'latest'")
    });

    it('no "latest" tag entry should exist when requested version range is already latest', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = '~7.0.18';
      const testSatisfiesVersion = '7.0.18';

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[1].name != 'latest', "Name should not match 'latest'")
    });

    it('returns a "latest" tag entry when requested version is not latest', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      let testRequestVersion = '7.0.0';
      let testSatisfiesVersion = '7.0.0';

      let testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[1].name === 'latest', "Name should match 'latest'");
    });

    it('returns a "latest" tag entry when requested version range is not latest', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      let testRequestVersion = '~7.0.0';
      let testSatisfiesVersion = '7.0.18';

      let testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[1].name === 'latest', "Name should match 'latest'");
    });

    it('"satisfies" tag entry should be latest and install latest when requested version is equal to the latest', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = '7.0.18';
      const testSatisfiesVersion = '7.0.18';

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[0].isLatestVersion === true, "Should be latest version");
      assert.ok(testResults[0].satisfiesLatest === true, "Should install latest version");
    });

    it('"satisfies" tag entry should not be latest but install latest when requested version satisfies the latest', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = '7.0.1';
      const testSatisfiesVersion = '7.0.18';

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[0].isLatestVersion === false, "Should not be latest version");
      assert.ok(testResults[0].satisfiesLatest === true, "Should install latest version");
    });

    it('"satisfies" tag entry should not be latest or install latest when requested version does not satisfy the latest', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = '6.0.0';
      const testSatisfiesVersion = '6.0.0';

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[0].isLatestVersion === false, "Should not be latest version");
      assert.ok(testResults[0].satisfiesLatest === false, "Should install latest version");
    });

    it('"satisfies".isInvalid is true when requested version is invalid', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = 'sds11312';
      const testSatisfiesVersion = null;

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[0].isInvalid === true, "isInvalid should be true")
    });

    it('"satisfies".isInvalid is false when requested version is valid', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = 'sds11312';
      const testSatisfiesVersion = null;

      fixture.versions.forEach(testRequestVersion => {
        const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testRequestVersion, fixture.distTags);
        assert.ok(testResults[0].isInvalid === false, `${testRequestVersion} was not valid`);
      });
    });

    it('"satisfies".versionMatchNotFound is true when requested version does not match anything', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = '1.2.3';
      const testSatisfiesVersion = null;

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[0].versionMatchNotFound === true, "Matched a version that does not exist");
      assert.ok(testResults[0].isInvalid === false, "Version should not be flagged as invalid");
    });

    it('"satisfies".versionMatchNotFound is false when requested version matches an existing versions', () => {
      const fixture = JSON.parse(fixtureMap.read('npm/node-types.json').content);
      const testRequestVersion = '~1.9.1';
      const testSatisfiesVersion = '1.9.1';

      const testResults = NpmVersionParserModule.extractTagsFromDistTagList(testRequestVersion, testSatisfiesVersion, fixture.distTags);
      assert.ok(testResults[0].versionMatchNotFound === false, "Did not match a version that does exists")
      assert.ok(testResults[0].isInvalid === false, "Version should not be flagged as invalid");
    });

  });

});