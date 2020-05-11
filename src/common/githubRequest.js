import { ExpiryCacheMap } from '../core/caching/expiryCacheMap';

class GithubRequest {

  constructor() {
    this.cache = new ExpiryCacheMap();
    this.headers = {
      accept: 'application\/vnd.github.v3+json',
      'user-agent': 'vscode-contrib/vscode-versionlens'
    };
  }

  getCommitBySha(userRepo, sha) {
    return this.httpGet(userRepo, `commits/${sha}`)
      .then(firstEntry => {
        return {
          sha: firstEntry.sha,
          date: firstEntry.commit.committer.date
        };
      });
  }

  getLatestCommit(userRepo) {
    return this.httpGet(userRepo, 'commits', { page: 1, per_page: 1 })
      .then(entries => {
        const firstEntry = entries[0];
        return {
          category: 'commit',
          version: firstEntry.sha.substring(0, 7)
        };
      });
  }

  getLatestPreRelease(userRepo) {
    return this.httpGet(userRepo, 'releases/latest')
      .then(result => {
        if (Array.isArray(result))
          result = result[0];
        return result && {
          category: 'prerelease',
          version: result.tag_name
        };
      });
  }

  getLatestRelease(userRepo) {
    return this.httpGet(userRepo, 'releases', { page: 1, per_page: 1 })
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
    return this.httpGet(userRepo, 'tags', { page: 1, per_page: 1 })
      .then(entries => {
        if (!entries || entries.length === 0)
          return null;

        const firstEntry = entries[0];
        return this.getCommitBySha(userRepo, firstEntry.commit.sha)
          .then(entry => ({ category: 'tag', version: firstEntry.name }));
      })
  }

  repoExists(userRepo) {
    return this.httpHead(userRepo)
      .then(resp => true)
      .catch(resp => resp.status !== 403)
  }

  httpGet(userRepo, category, queryParams) {
    return this.request('GET', userRepo, category, queryParams)
      .catch(error => {
        // handles any 404 errors during a request for the latest release
        if (error.status === 404 && category === 'releases/latest') {
          return this.cache.set(
            url,
            null
          );
        }

        // check if the request was not found and report back
        error.resourceNotFound = (
          error.status = 404 &&
          error.data.message.includes('Not Found')
        );

        // check if we have exceeded the rate limit
        error.rateLimitExceeded = (
          error.status = 403 &&
          error.data.message.includes('API rate limit exceeded')
        );

        // check if bad credentials were given
        error.badCredentials = (
          error.status = 403 &&
          error.data.message.includes('Bad credentials')
        );

        // reject all other errors
        return Promise.reject(error);
      });
  }

  httpHead(userRepo) {
    return this.request('HEAD', userRepo, null, null)
  }

  request(method, userRepo, category, queryParams) {
    const url = generateGithubUrl(userRepo, category, queryParams);
    const cacheKey = method + '_' + url;

    if (this.cache.hasExpired(url) === false)
      return Promise.resolve(this.cache.get(cacheKey));

    return require('request-light').xhr({ url, type: method, headers: this.headers })
      .then(response => {
        return this.cache.set(cacheKey, response.responseText && JSON.parse(response.responseText))
      })
      .catch(response => {
        return Promise.reject({
          status: response.status,
          data: this.cache.set(cacheKey, JSON.parse(response.responseText))
        });
      });
  }

}

function generateGithubUrl(userRepo, path, queryParams) {
  let query = '';
  if (queryParams)
    query = '?' + Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');

  return `https://api.github.com/repos/${userRepo}/${path}${query}`;
}

export const githubRequest = new GithubRequest();