/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { npmDefaultDependencyProperties } from './providers/npm/config';
import { pubDefaultDependencyProperties, pubDefaultApiUrl } from './providers/pub/config';
import { dubDefaultDependencyProperties } from './providers/dub/config';
import { dotnetCSProjDefaultDependencyProperties, dotnetDefaultNuGetFeeds } from './providers/dotnet/config';
import { mavenDefaultDependencyProperties } from './providers/maven/config';
import { composerDefaultDependencyProperties } from './providers/composer/config';

const { workspace } = require('vscode');

export default new class AppContribution {

  get showVersionLensesAtStartup() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("showVersionLensesAtStartup", true);
  }

  get showTaggedVersionsAtStartup() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("showTaggedVersionsAtStartup", false);
  }

  get showDependencyStatusesAtStartup() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("showDependencyStatusesAtStartup", false);
  }

  get versionPrefix() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("versionPrefix", "");
  }

  get npmDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("npm.dependencyProperties", npmDefaultDependencyProperties);
  }

  get npmDistTagFilter() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("npm.distTagFilter", []);
  }

  get pubDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("pub.dependencyProperties", pubDefaultDependencyProperties);
  }

  get pubApiUrl() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("pub.apiUrl", pubDefaultApiUrl);
  }

  get dotnetCSProjDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dotnet.dependencyProperties", dotnetCSProjDefaultDependencyProperties);
  }

  get dotnetTagFilter() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dotnet.tagFilter", []);
  }

  get dotnetNuGetFeeds() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dotnet.nugetFeeds", dotnetDefaultNuGetFeeds);
  }

  get dotnetIncludePrerelease() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dotnet.includePrerelease", true);
  }

  get dubDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dub.dependencyProperties", dubDefaultDependencyProperties);
  }

  get mavenDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("maven.dependencyProperties", mavenDefaultDependencyProperties);
  }

  get mavenTagFilter() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("maven.tagFilter", []);
  }

  get composerDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("composer.dependencyProperties", composerDefaultDependencyProperties);
  }

  get githubTaggedCommits() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('github.taggedCommits', ['Release', 'Tag']);
  }

  get missingDependencyColour() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('missingDependencyColour', 'red');
  }

  get installedDependencyColour() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('installedDependencyColour', 'green');
  }

  get outdatedDependencyColour() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('outdatedDependencyColour', 'orange');
  }

  get prereleaseDependencyColour() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('prereleaseDependencyColour', 'yellowgreen');
  }

}
