/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {
  assertInstanceOf,
  assertTypeOf,
  assertDefined,
  assertEmpty
} from 'common/typeAssertion';

const assert = require('assert');

export const TypeAssertionTests = {

  "assertInstanceOf": {

    "throws an error when instanceof is false": () => {
      let testThrowFn = () => {
        assertInstanceOf([], String, "Array is not an instanceof String");
      };
      assert.throws(testThrowFn, /Array is not an instanceof String$/);
    },

    "does not throw an error when instanceof is true": () => {
      let testThrowFn = () => {
        assertInstanceOf([], Array, "Array is an instanceof Array");
      };
      assert.doesNotThrow(testThrowFn, /Array is an instanceof Array$/);
    }

  },

  "assertTypeOf": {

    "throws an error when assertTypeOf is false": () => {
      let testThrowFn = () => {
        assertTypeOf("", "object", "String is not an typeof object");
      };
      assert.throws(testThrowFn, /String is not an typeof object$/);
    },

    "does not throw an error when assertTypeOf is true": () => {
      let testThrowFn = () => {
        assertTypeOf("", "string", "String is a typeof string");
      };
      assert.doesNotThrow(testThrowFn, ReferenceError, "String is a typeof string");
    }

  },

  "assertDefined": {

    "throws an error when assertDefined is false": () => {
      let testThrowFn = () => {
        assertDefined(undefined, "parameter is undefined");
      };
      assert.throws(testThrowFn, /parameter is undefined$/);
    }

  },

  "does not throw an error when assertDefined is true": () => {
    let testThrowFn = () => {
      assertDefined("", "parameter is defined");
    };
    assert.doesNotThrow(testThrowFn, ReferenceError, "parameter is defined");
  },


  "assertEmpty": {

    "throws an error when assertEmpty is false": () => {
      let testThrowFn = () => {
        assertEmpty("", "string is empty");
      };
      assert.throws(testThrowFn, /string is empty$/);

      testThrowFn = () => {
        assertEmpty([], "array is empty");
      };
      assert.throws(testThrowFn, /array is empty$/);
    },

    "does not throw an error when assertEmpty is true": () => {
      let testThrowFn = () => {
        assertEmpty("1", "string is empty");
      };
      assert.doesNotThrow(testThrowFn, "string is empty");

      testThrowFn = () => {
        assertEmpty([1], "array is empty");
      };
      assert.doesNotThrow(testThrowFn, "array is empty");
    }

  }

};