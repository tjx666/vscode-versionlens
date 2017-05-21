/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { parseDependencyNodes } from '../../../src/common/dependencyParser';

describe('DependencyParser', () => {

  describe('parseDependencyNodes', () => {

    it('passes arguments to customVersionParser when specified', done => {
      const dependencyNodes = [{
        name: 'test',
        value: '1.2.3'
      }];
      const appConfig = {};
      let funcCalled = false;

      const promiseCollection = parseDependencyNodes(
        dependencyNodes, appConfig,
        (testName, testVersion, testConfig) => {
          funcCalled = true;
          assert.ok(testName === dependencyNodes[0].name, 'customVersionParser: testName does not match');
          assert.ok(testVersion === dependencyNodes[0].value, 'customVersionParser: testVersion does not match');
          assert.ok(testConfig === appConfig, 'customVersionParser: appConfig does not match');
          return Promise.resolve({
            name: testName,
            version: testVersion
          });
        }
      );

      assert.ok(funcCalled, 'customVersionParser: was not called');

      // check that the result of the customParser is returned in a promise
      Promise.all(promiseCollection)
        .then(results => {
          assert.ok(results[0][0].node === dependencyNodes[0], 'customVersionParser: node does not match');
          done();
        })
        .catch(console.error.bind(console));

    });

    it('returns a collection of nodes wrapped in promises when no customVersionParser is specified', done => {
      const dependencyNodes = [{}, {}, {}];
      const appConfig = {};
      const promiseCollection = parseDependencyNodes(
        dependencyNodes,
        appConfig
      );

      Promise.all(promiseCollection)
        .then(results => {
          assert.ok(results[0].node === dependencyNodes[0], 'parseDependencyNodes: node does not match');
          assert.ok(results[1].node === dependencyNodes[1], 'parseDependencyNodes: node does not match');
          assert.ok(results[2].node === dependencyNodes[2], 'parseDependencyNodes: node does not match');
          done();
        })
        .catch(console.error.bind(console));
    });

  });

});