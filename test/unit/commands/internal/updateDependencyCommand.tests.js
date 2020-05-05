/* --------------------------------------------------------------------------------------------
 * Copyright (c) Peter Flannery. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as InternalCommands from 'commands/internal'

const assert = require('assert')
const mock = require('mock-require')

let vscodeMock

export const updateDependencyCommandTests = {

  beforeAll: () => {
    // mock require modules
    vscodeMock = {
      TextEdit: {},
      WorkspaceEdit: class { },
      workspace: {}
    }
    mock('vscode', vscodeMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    // reset mocks
    vscodeMock.TextEdit.replace = (source, subst) => { }
    vscodeMock.WorkspaceEdit = class {
      set(docUrl, changeList) { }
    }
    vscodeMock.workspace.applyEdit = (docUrl, changeList) => { }
  },

  'replaces given range with version': () => {
    let called = 0
    const codeLensMock = {
      replaceRange: "expected range"
    }
    const expectedVersion = '1.2.3'

    vscodeMock.TextEdit.replace = (actualRange, actualVersion) => {
      assert.equal(actualRange, codeLensMock.replaceRange, `actual = ${actualRange}`)
      assert.equal(actualVersion, expectedVersion, `actual = ${actualVersion}`)
      called++
    }

    // test
    InternalCommands.updateDependencyCommand(codeLensMock, expectedVersion)

    // ensure we called the method under test
    assert.equal(called, 1, `actual = ${called}`)
  },

  'vscode workspaceEdit sets expected url and change list': () => {
    let called = 0
    const codeLensMock = {
      documentUrl: 'expected url'
    }
    const expectedEdit = {}
    vscodeMock.TextEdit.replace = (actualRange, actualVersion) => expectedEdit
    vscodeMock.WorkspaceEdit = class {
      set(actualUrl, actualChangeList) {
        assert.equal(actualUrl, codeLensMock.documentUrl, `actual = ${actualUrl}`)
        assert.equal(actualChangeList[0], expectedEdit, `actual = ${actualChangeList}`)
        called++
      }
    }

    // test
    InternalCommands.updateDependencyCommand(codeLensMock, '')

    // ensure we called the method under test
    assert.equal(called, 1, `actual = ${called}`)
  },

  'vscode workspace applies expected edit': () => {
    let called = 0
    const expectedClass = vscodeMock.WorkspaceEdit = class {
      constructor() {
        this.check = 'edit'
      }
      set(docUrl, changeList) { }
    }

    vscodeMock.workspace.applyEdit = function (actualEdit) {
      assert.ok(actualEdit instanceof expectedClass, `actual = ${actualEdit}`)
      assert.equal(actualEdit.check, 'edit', `actual = ${actualEdit}`)
      called++
    }

    // test
    InternalCommands.updateDependencyCommand({}, '')

    // ensure we called the method under test
    assert.equal(called, 1, `actual = ${called}`)
  }

}