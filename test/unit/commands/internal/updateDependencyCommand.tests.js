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
      WorkspaceEdit: class { },
      workspace: {}
    }
    mock('vscode', vscodeMock)
  },

  afterAll: () => mock.stopAll(),

  beforeEach: () => {
    // reset mocks
    vscodeMock.WorkspaceEdit = class {
      replace(docUrl, source, subst) { }
    }
    vscodeMock.workspace = class {
      applyEdit(docUrl, changeList) { }
    }
  },

  'replaces given range with version': () => {
    let called = 0
    const codeLensMock = {
      documentUrl: "expected document url",
      replaceRange: "expected range"
    }
    const expectedVersion = '1.2.3'
    vscodeMock.workspace.applyEdit = () => Promise.resolve();

    vscodeMock.WorkspaceEdit = class {
      replace = (actualDocumentUrl, actualRange, actualVersion) => {
        assert.equal(actualDocumentUrl, codeLensMock.documentUrl, `actual = ${actualDocumentUrl}`)
        assert.equal(actualRange, codeLensMock.replaceRange, `actual = ${actualRange}`)
        assert.equal(actualVersion, expectedVersion, `actual = ${actualVersion}`)
        called++
      }
    }

    // test
    InternalCommands.updateDependencyCommand(codeLensMock, expectedVersion)

    // ensure we called the method under test
    assert.equal(called, 1, `actual = ${called}`)
  },

  'vscode workspace applies expected edit': () => {
    let called = 0
    const expectedClass = vscodeMock.WorkspaceEdit = class {
      constructor() {
        this.check = 'edit'
      }
      replace(actualUrl, actualRange, actualVersion) { }
    }

    vscodeMock.workspace.applyEdit = function (actualEdit) {
      assert.ok(actualEdit instanceof expectedClass, `actual = ${actualEdit}`)
      assert.equal(actualEdit.check, 'edit', `actual = ${actualEdit}`)
      called++
      return Promise.resolve();
    }

    // test
    InternalCommands.updateDependencyCommand({}, '')

    // ensure we called the method under test
    assert.equal(called, 1, `actual = ${called}`)
  }

}