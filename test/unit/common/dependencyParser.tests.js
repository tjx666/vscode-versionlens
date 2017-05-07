/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
import { parseDependencyNodes } from '../../../src/common/dependencyParser';

describe('DependencyParser', () => {

  describe('parseDependencyNodes', () => {

    it('passes arguments to customVersionParser when specified', done => {
      const dependencyNodes = [{}];
      const appConfig = {};
      let funcCalled = false;

      const promiseCollection = parseDependencyNodes(
        dependencyNodes, appConfig,
        (testNode, testConfig) => {
          funcCalled = true;
          assert.ok(testNode === dependencyNodes[0], 'customVersionParser(node, appConfig): testNode does not match');
          assert.ok(testConfig === appConfig, 'customVersionParser(node, appConfig): appConfig does not match');
          return { node: testNode };
        }
      );

      assert.ok(funcCalled, 'customVersionParser(node, appConfig): was not called');

      // check that the result of the customParser is returned in a promise
      Promise.all(promiseCollection)
        .then(results => {
          assert.ok(results[0].node === dependencyNodes[0], 'customVersionParser(node, appConfig): node does not match');
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
          assert.ok(results[0].node === dependencyNodes[0], 'customVersionParser(node, appConfig): node does not match');
          assert.ok(results[1].node === dependencyNodes[1], 'customVersionParser(node, appConfig): node does not match');
          assert.ok(results[2].node === dependencyNodes[2], 'customVersionParser(node, appConfig): node does not match');
          done();
        })
        .catch(console.error.bind(console));
    });

  });

});