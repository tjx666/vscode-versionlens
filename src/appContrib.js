export default new class AppContribution {

  get showVersionLensesAtStartup() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get("showVersionLensesAtStartup", true);
  }

  get showTaggedVersionsAtStartup() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get("showTaggedVersionsAtStartup", false);
  }

  get showDependencyStatusesAtStartup() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get("showDependencyStatusesAtStartup", false);
  }

  get versionPrefix() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get("versionPrefix", "");
  }

  get githubTaggedCommits() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get('github.taggedCommits', ['Release', 'Tag']);
  }

  get missingDependencyColour() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get('missingDependencyColour', 'red');
  }

  get installedDependencyColour() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get('installedDependencyColour', 'green');
  }

  get outdatedDependencyColour() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get('outdatedDependencyColour', 'orange');
  }

  get prereleaseDependencyColour() {
    const { workspace } = require('vscode');
    const config = workspace.getConfiguration('versionlens');
    return config.get('prereleaseDependencyColour', 'yellowgreen');
  }

}