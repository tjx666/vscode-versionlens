import { commands } from 'vscode';
import { appConfig } from './appConfiguration';

let _isActive = false;
let _showDistTags = false;
let _showVersionLenses = false;

const config = {
  extentionName: "versionlens",
  updateIndicator: '⬆',
  openNewWindowIndicator: '⧉',

  get isActive() {
    return _isActive;
  },
  set isActive(newValue) {
    _isActive = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extentionName}.isActive`,
      _isActive
    );
  },

  get showDistTags() {
    return _showDistTags;
  },
  set showDistTags(newValue) {
    _showDistTags = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extentionName}.showDistTags`,
      _showDistTags
    );
  },

  get showVersionLenses() {
    return _showVersionLenses;
  },
  set showVersionLenses(newValue) {
    _showVersionLenses = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extentionName}.show`,
      _showVersionLenses
    );
  }

};

// ensure the context is set to the defaults
config.showDistTags = appConfig.showDistTagsAtStartup === true;
config.showVersionLenses = appConfig.showVersionLensesAtStartup === true;

export default config;