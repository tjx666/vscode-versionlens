/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as InternalCommands from 'presentation/commands/internal'

const assert = require('assert')
const mock = require('mock-require')

let pathMock
let openerMock

export const LinkCommandTests = {

  beforeAll: () => {
    // mock require modules
    pathMock = {
      resolve: (...args) => args.join('/'),
      dirname: path => path
    }
    mock('path', pathMock)

    openerMock = function () { }
    const openerMockWrapper = function (...args) {
      openerMock(...args)
    }
    mock('opener', openerMockWrapper)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    // reset mocks
    openerMock = function () { }
  },

  'opens remoteUrl when meta.type is not a file': () => {
    let called = 0
    const codeLensMock = {
      package: {
        meta: {
          type: 'github',
          remoteUrl: 'expected url'
        }
      }
    }

    openerMock = function (actualUrl) {
      assert.equal(
        actualUrl,
        codeLensMock.package.meta.remoteUrl,
        `actual = ${actualUrl}`
      )
      called++
    }

    // test
    InternalCommands.linkCommand(codeLensMock)

    // ensure we called the method under test
    assert.equal(called, 1, `actual = ${called}`)
  },

  'opens file path when meta.type is a file': () => {
    let called = 0
    const codeLensMock = {
      documentUrl: {
        fsPath: 'expected path'
      },
      package: {
        meta: {
          type: 'file',
          remoteUrl: 'expected url'
        }
      }
    }

    openerMock = function (actualFilePath) {
      assert.equal(
        `${actualFilePath}`,
        `${codeLensMock.documentUrl.fsPath}/${codeLensMock.package.meta.remoteUrl}`,
        `actual = ${actualFilePath}`
      )
      called++
    }

    // test
    InternalCommands.linkCommand(codeLensMock)

    // ensure we called the method under test
    assert.equal(called, 1, `actual = ${called}`)
  }

}