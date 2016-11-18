/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { register } from './common/di';
import { AppConfiguration } from './common/appConfiguration';
import { CommandFactory } from './providers/commandFactory';
import { GithubRequest } from './common/githubRequest';

import * as path from 'path';
import * as fs from 'fs';
import * as semver from 'semver';
import * as jsonParser from 'vscode-contrib-jsonc';
import * as httpRequest from 'request-light';
import * as npm from 'npm';
import * as bower from 'bower';

// external lib dependencies
register('path', path);
register('fs', fs);
register('semver', semver);
register('bower', bower);
register('npm', npm);
register('jsonParser', jsonParser);
register('httpRequest', httpRequest);

// app dependencies
register('appConfig', new AppConfiguration());
register('commandFactory', new CommandFactory());
register('githubRequest', new GithubRequest())

export const bootstrapLoaded = true;