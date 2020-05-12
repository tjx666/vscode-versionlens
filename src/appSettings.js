import appContrib from './appContrib';

const { commands } = require('vscode');

let _isActive = false;
let _inProgress = false;
let _showTaggedVersions = false;
let _showVersionLenses = false;
let _showDependencyStatuses = false;

const config = {
  extensionName: "versionlens",
  updateIndicator: '\u2191',
  revertIndicator: '\u2193',
  openNewWindowIndicator: '\u29C9',

  get isActive() {
    return _isActive;
  },
  set isActive(newValue) {
    _isActive = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.isActive`,
      _isActive
    );
  },

  get showTaggedVersions() {
    return _showTaggedVersions;
  },
  set showTaggedVersions(newValue) {
    _showTaggedVersions = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.showTaggedVersions`,
      _showTaggedVersions
    );
  },

  get showDependencyStatuses() {
    return _showDependencyStatuses;
  },
  set showDependencyStatuses(newValue) {
    _showDependencyStatuses = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.showDependencyStatuses`,
      _showDependencyStatuses
    );
  },

  get showVersionLenses() {
    return _showVersionLenses;
  },
  set showVersionLenses(newValue) {
    _showVersionLenses = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.show`,
      _showVersionLenses
    );
  },

  get inProgress() {
    return _inProgress;
  },
  set inProgress(newValue) {
    if (_inProgress === newValue) return;
    _inProgress = newValue;
    commands.executeCommand(
      'setContext',
      `${this.extensionName}.inProgress`,
      newValue
    );
  },

};

// set any defaults
config.showTaggedVersions = appContrib.showTaggedVersionsAtStartup === true;
config.showVersionLenses = appContrib.showVersionLensesAtStartup === true;
config.showDependencyStatuses = appContrib.showDependencyStatusesAtStartup === true;
config.inProgress = false

export default config;