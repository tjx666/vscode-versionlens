/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {register} from './common/di';
import * as semver from 'semver';
import * as jsonParser from 'vscode-contrib-jsonc';
import * as httpRequest from 'request-light';
import * as npm from 'npm';
import * as bower from 'bower';

register('semver', semver);
register('bower', bower);
register('npm', npm);
register('jsonParser', jsonParser);
register('httpRequest', httpRequest);

export const bootstrapLoaded = true;