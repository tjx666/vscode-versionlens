/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { workspace } from 'vscode';
import { npmDefaultDependencyProperties } from '../providers/npm/config';
import { bowerDefaultDependencyProperties } from '../providers/bower/config';
import { dotnetDefaultDependencyProperties } from '../providers/dotnet/config';
import { dubDefaultDependencyProperties } from '../providers/dub/config';

export class AppConfiguration {

  get extentionName() {
    return "versionlens";
  }

  get versionPrefix() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("versionPrefix", "");
  }

  get npmDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("npm.dependencyProperties", npmDefaultDependencyProperties);
  }

  get bowerDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("bower.dependencyProperties", bowerDefaultDependencyProperties);
  }

  get dotnetDependencyProperties() {
    const config = workspace.getConfiguration('versionlens');
    return config.get("dotnet.dependencyProperties", dotnetDefaultDependencyProperties);
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

  get updateIndicator() {
    return '⬆';
  }

  get openNewWindowIndicator() {
    return '⧉'
  }

}