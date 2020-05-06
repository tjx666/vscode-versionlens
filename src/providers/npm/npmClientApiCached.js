/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExpiryCacheMap } from '../../common/expiryCacheMap';
import * as NpmClientApi from './npmClient';

export let cache = new ExpiryCacheMap();

export const npmPackageDirExists = NpmClientApi.npmPackageDirExists;

export function npmViewVersion(packagePath, packageName) {
  const cacheKey = `npmViewVersion_${packageName}_${packagePath}`;

  if (cache.hasExpired(cacheKey) === false) {
    return Promise.resolve(cache.get(cacheKey));
  }

  return NpmClientApi.npmViewVersion(packagePath, packageName)
    .then(result => {
      return cache.set(cacheKey, result);
    });
}

export function npmViewDistTags(packagePath, packageName) {
  const cacheKey = `npmViewDistTags_${packageName}_${packagePath}`;
  if (cache.hasExpired(cacheKey) === false) {
    return Promise.resolve(cache.get(cacheKey));
  }

  return NpmClientApi.npmViewDistTags(packagePath, packageName)
    .then(result => {
      return cache.set(cacheKey, result);
    });
}

export function npmGetOutdated(packagePath) {
  const cacheKey = `npmGetOutdated_${packagePath}`;
  if (cache.hasExpired(cacheKey) === false) {
    return Promise.resolve(cache.get(cacheKey));
  }

  return NpmClientApi.npmGetOutdated(packagePath)
    .then(result => {
      return cache.set(cacheKey, result);
    });
}

export function parseNpmArguments(packagePath, packageName, packageVersion) {
  const cacheKey = `parseNpmArguments_${packageName}_${packageVersion}_${packagePath}`;
  if (cache.hasExpired(cacheKey) === false) {
    return Promise.resolve(cache.get(cacheKey));
  }

  return NpmClientApi.parseNpmArguments(packagePath, packageName, packageVersion)
    .then(result => {
      return cache.set(cacheKey, result);
    });
}