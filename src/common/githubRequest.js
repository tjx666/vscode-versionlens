/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { inject } from './di';
import { CacheMap } from './cacheMap';

@inject('httpRequest', 'appConfig')
export class GithubRequest {

  constructor() {
    this.cache = new CacheMap();
  }

  getCommitBySha(userRepo, sha) {
    return this.doRequest(userRepo, `commits/${sha}`, true)
      .then(firstEntry => {
        return {
          sha: firstEntry.sha,
          date: firstEntry.commit.committer.date
        };
      });
  }

  getLatestCommit(userRepo) {
    return this.doRequest(userRepo, 'commits', true)
      .then(entries => {
        const firstEntry = entries[0];
        return {
          category: 'commit',
          version: firstEntry.sha.substring(0, 7)
        };
      });
  }

  getLatestRelease(userRepo, incPreReleases) {
    return this.doRequest(userRepo, `releases${incPreReleases ? '' : '/latest'}`, incPreReleases)
      .then(result => {
        if (Array.isArray(result))
          result = result[0];
        return result && {
          category: 'release',
          version: result.tag_name
        };
      });
  }

  getLatestTag(userRepo) {
    return this.doRequest(userRepo, 'tags', true)
      .then(entries => {
        if (!entries || entries.length === 0)
          return null;

        const firstEntry = entries[0];
        return this.getCommitBySha(userRepo, firstEntry.commit.sha)
          .then(entry => ({ category: 'tag', version: firstEntry.name }));
      })
  }

  doRequest(userRepo, category, paginated) {
    const url = `https://api.github.com/repos/${userRepo}/${category}${paginated ? '?page=1&per_page=1' : ''}`;
    const headers = {
      accept: 'application\/vnd.github.v3+json',
      'user-agent': 'vscode-contrib/vscode-versionlens'
    };

    if (this.cache.expired(url) === false)
      return Promise.resolve(this.cache.get(url));

    return this.httpRequest.xhr({ url, headers })
      .then(response => this.cache.set(url, JSON.parse(response.responseText)))
      .catch(response => {
        const error = JSON.parse(response.responseText);
        // handles any 404 errors during a request for the latest release
        if (response.status = 404 && category === 'releases/latest') {
          return this.cache.set(
            url,
            null
          );
        }

        // check if the request was not found and report back
        error.notFound = (
          response.status = 404 &&
          error.message.includes('Not Found')
        );

        // check if we have exceeded the rate limit
        error.rateLimitExceeded = (
          response.status = 403 &&
          error.message.includes('API rate limit exceeded')
        );

        // reject all other errors
        return Promise.reject(error);
      });
  }

}

