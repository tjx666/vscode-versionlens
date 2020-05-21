import { ILogger } from "core/logging";
import {
  HttpClientRequestMethods,
  JsonClientResponse,
  HttpRequestOptions
} from "core/clients";
import {
  PackageRequest,
  PackageSourceTypes,
  PackageVersionTypes,
  VersionHelpers,
  SuggestionFactory,
  PackageDocument,
  DocumentFactory,
  ResponseFactory
} from "core/packages";

import { JsonHttpClientRequest } from "infrastructure/clients";

import { NpmConfig } from "../npmConfig";
import { NpaSpec } from "../models/npaSpec";

const defaultHeaders = {
  accept: 'application\/vnd.github.v3+json',
  'user-agent': 'vscode-contrib/vscode-versionlens'
};

export class GithubClient extends JsonHttpClientRequest {

  config: NpmConfig;

  constructor(config: NpmConfig, options: HttpRequestOptions, logger: ILogger) {
    super(logger, options, defaultHeaders);
    this.config = config;
  }

  fetchGithub(
    request: PackageRequest<null>, npaSpec: NpaSpec
  ): Promise<PackageDocument> {
    const { validRange } = require('semver');

    if (npaSpec.gitRange) {
      // we have a semver:x.x.x
      return this.fetchTags(request, npaSpec);
    }

    if (validRange(npaSpec.gitCommittish, VersionHelpers.loosePrereleases)) {
      // we have a #x.x.x
      npaSpec.gitRange = npaSpec.gitCommittish;
      return this.fetchTags(request, npaSpec);
    }

    // we have a #commit
    return this.fetchCommits(request, npaSpec);
  }

  fetchTags(
    request: PackageRequest<null>,
    npaSpec: NpaSpec
  ): Promise<PackageDocument> {
    // todo pass in auth
    const { user, project } = npaSpec.hosted;
    const tagsRepoUrl = `https://api.github.com/repos/${user}/${project}/tags`;

    let headers = {};

    if (this.config.github.accessToken && this.config.github.accessToken.length > 0) {
      (<any>headers).authorization = `token ${this.config.github.accessToken}`;
    }

    return this.requestJson(HttpClientRequestMethods.get, tagsRepoUrl, {})
      .then(function (response: JsonClientResponse): PackageDocument {
        // extract versions
        const tags = <[]>response.data;

        const rawVersions = tags.map((tag: any) => tag.name);

        const allVersions = VersionHelpers.filterSemverVersions(rawVersions);

        const source: PackageSourceTypes = PackageSourceTypes.Github;

        const { providerName } = request;

        const requested = request.package;

        const type: PackageVersionTypes = npaSpec.gitRange ?
          PackageVersionTypes.Range :
          PackageVersionTypes.Version;

        const versionRange = npaSpec.gitRange;

        const resolved = {
          name: project,
          version: versionRange,
        };

        // seperate versions to releases and prereleases
        const { releases, prereleases } = VersionHelpers.splitReleasesFromArray(
          allVersions
        );

        // analyse suggestions
        const suggestions = SuggestionFactory.createSuggestionTags(
          versionRange,
          releases,
          prereleases
        );

        return {
          providerName,
          source,
          response,
          type,
          requested,
          resolved,
          suggestions
        };

      });

  }

  fetchCommits(request: PackageRequest<null>, npaSpec: NpaSpec): Promise<PackageDocument> {
    // todo pass in auth
    const { user, project } = npaSpec.hosted;
    const commitsRepoUrl = `https://api.github.com/repos/${user}/${project}/commits`;

    return this.requestJson(HttpClientRequestMethods.get, commitsRepoUrl, {})
      .then((response: JsonClientResponse) => {

        const commitInfos = <[]>response.data

        const commits = commitInfos.map((commit: any) => commit.sha);

        const source: PackageSourceTypes = PackageSourceTypes.Github;

        const { providerName } = request;

        const requested = request.package;

        const type = PackageVersionTypes.Committish;

        const versionRange = npaSpec.gitCommittish;

        if (commits.length === 0) {
          // no commits found
          return DocumentFactory.createNotFound(
            providerName,
            requested,
            PackageVersionTypes.Version,
            ResponseFactory.createResponseStatus(response.source, 404)
          )
        }

        const commitIndex = commits.findIndex(
          commit => commit.indexOf(versionRange) > -1
        );

        const latestCommit = commits[commits.length - 1].substr(0, 8);

        const noMatch = commitIndex === -1;

        const isLatest = versionRange === latestCommit;

        const resolved = {
          name: project,
          version: versionRange,
        };

        const suggestions = [];

        if (noMatch) {
          suggestions.push(
            SuggestionFactory.createNoMatch(),
            SuggestionFactory.createLatest(latestCommit)
          );
        } else if (isLatest) {
          suggestions.push(
            SuggestionFactory.createMatchesLatest()
          );
        } else if (commitIndex > 0) {
          suggestions.push(
            SuggestionFactory.createFixedStatus(versionRange),
            SuggestionFactory.createLatest(latestCommit)
          );
        }

        return {
          providerName,
          source,
          response,
          type,
          requested,
          resolved,
          suggestions,
          gitSpec: npaSpec.saveSpec
        };

      });

  }

}