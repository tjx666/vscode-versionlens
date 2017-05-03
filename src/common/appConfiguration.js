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

  get versionPrefix() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("versionPrefix", "");
  }

  get npmDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("npm.dependencyProperties", npmDefaultDependencyProperties);
  }

  get npmShowDistTags() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("npm.showDistTags", false);
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

  get dubDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dub.dependencyProperties", dubDefaultDependencyProperties);
  }

  get githubCompareOptions() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('github.compareOptions', ['Release', 'Tag', 'Commit']);
  }

  get githubAccessToken() {
    const config = workspace.getConfiguration('versionlens');
    return config.get('github.accessToken', null);
  }

}

export const appConfig = new AppConfiguration();