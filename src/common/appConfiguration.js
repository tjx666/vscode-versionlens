/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workspace } from 'vscode';
import { npmDefaultDependencyProperties } from '../providers/npm/config';
import { bowerDefaultDependencyProperties } from '../providers/bower/config';
import { dotnetCSProjDefaultDependencyProperties, dotnetProjectJsonDefaultDependencyProperties } from '../providers/dotnet/config';
import { dubDefaultDependencyProperties } from '../providers/dub/config';

class AppConfiguration {

  get showVersionLensesAtStartup() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("showVersionLensesAtStartup", true);
  }

  get showTaggedVersionsAtStartup() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("showTaggedVersionsAtStartup", false);
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

  get bowerDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("bower.dependencyProperties", bowerDefaultDependencyProperties);
  }

  get dotnetCSProjDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dotnet-csproj.dependencyProperties", dotnetCSProjDefaultDependencyProperties);
  }

  get dotnetTagFilter() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dotnet.tagFilter", []);
  }

  get dubDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dub.dependencyProperties", dubDefaultDependencyProperties);
  }

  get githubTaggedCommits() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('github.taggedCommits', ['Release', 'Tag']);
  }

  get githubAccessToken() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('github.accessToken', null);
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

export const appConfig = new AppConfiguration();