import { ILogger } from 'core/logging';
import { HttpClientRequestMethods, CachingOptions } from 'core/clients';
import { JsonHttpClientRequest } from './jsonHttpClientRequest';

export class GithubRequest extends JsonHttpClientRequest {

  constructor(logger, cachingOptions) {
    super(
      logger,
      cachingOptions,
      {
        accept: 'application\/vnd.github.v3+json',
        'user-agent': 'vscode-contrib/vscode-versionlens'
      }
    );
  }

  async getCommitBySha(userRepo, sha) {
    return this.httpGet(userRepo, `commits/${sha}`)
      .then(firstEntry => {
        return {
          sha: firstEntry.sha,
          date: firstEntry.commit.committer.date
        };
      });
  }

  async getLatestCommit(userRepo) {
    return this.httpGet(userRepo, 'commits', { page: 1, per_page: 1 })
      .then(entries => {
        const firstEntry = entries[0];
        return {
          category: 'commit',
          version: firstEntry.sha.substring(0, 7)
        };
      });
  }

  async getLatestPreRelease(userRepo) {
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

  async getLatestRelease(userRepo) {
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

  async getLatestTag(userRepo) {
    return this.httpGet(userRepo, 'tags', { page: 1, per_page: 1 })
      .then(entries => {
        if (!entries || entries.length === 0)
          return null;

        const firstEntry = entries[0];
        return this.getCommitBySha(userRepo, firstEntry.commit.sha)
          .then(entry => ({ category: 'tag', version: firstEntry.name }));
      })
  }

  async repoExists(userRepo) {
    return this.httpHead(userRepo)
      .then(resp => true)
      .catch(resp => resp.status !== 403)
  }

  async httpGet(userRepo, category, queryParams) {
    return this.requestGithub(HttpClientRequestMethods.get, userRepo, category, queryParams)
      .then(response => response.data)
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

  async httpHead(userRepo) {
    return super.requestJson(HttpClientRequestMethods.head, userRepo, null, null)
  }

  async requestGithub(method, userRepo, category, queryParams) {
    const url = `https://api.github.com/repos/${userRepo}/${category}`;
    return this.requestJson(method, url, queryParams)
  }

}

export const githubRequest = new GithubRequest();