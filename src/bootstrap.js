/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import {register} from './common/di';
import * as semver from 'semver';
import * as bower from 'bower';
import * as jsonParser from 'vscode-contrib-jsonc';
import * as httpRequest from 'request-light';

register('semver', semver);
register('bower', bower);
register('jsonParser', jsonParser);
register('httpRequest', httpRequest);

export const bootstrapLoaded = true;