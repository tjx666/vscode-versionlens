import {
  DocumentFactory,
  PackageRequest,
  SuggestionFactory,
  VersionHelpers,
  PackageDocument,
  PackageVersionTypes,
  PackageSourceTypes
} from 'core/packages';
import { ILogger } from 'core/logging';
import { ClientResponseSource, AbstractClientRequest } from "core/clients";
import { NpmConfig } from '../npmConfig';
import { NpaSpec, NpaTypes } from '../models/npaSpec';
import * as NpmUtils from '../npmUtils';

export class PacoteClient extends AbstractClientRequest<number, PackageDocument> {

  config: NpmConfig;

  constructor(config: NpmConfig, logger: ILogger) {
    super(config.caching);
    this.config = config;
  }

  async  fetchPackage(
    request: PackageRequest<null>, npaSpec: NpaSpec
  ): Promise<PackageDocument> {

    const cacheKey = `${request.package.name}@${request.package.version}_${request.package.path}`;
    if (this.cache.options.duration > 0 && this.cache.hasExpired(cacheKey) === false) {
      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) return Promise.reject(cachedResp);

      cachedResp.data.response.source = ClientResponseSource.cache;
      return Promise.resolve(cachedResp.data);
    }

    const pacote = require('pacote');
    const npmConfig = require('libnpmconfig');

    // get npm config
    const npmOpts = npmConfig.read(
      {
        where: request.package.path,
        fullMetadata: false,
        // 'prefer-online': true,
      },
      {
        cwd: request.package.path,
      }
    );

    return pacote.packument(npaSpec, npmOpts)
      .then(function (packumentResponse): PackageDocument {

        const { compareLoose } = require("semver");

        const { providerName } = request;

        const source: PackageSourceTypes = PackageSourceTypes.Registry;

        const type: PackageVersionTypes = <any>npaSpec.type;

        let versionRange: string = (type === PackageVersionTypes.Alias) ?
          npaSpec.subSpec.rawSpec :
          npaSpec.rawSpec;

        const resolved = {
          name: (type === PackageVersionTypes.Alias) ?
            npaSpec.subSpec.name :
            npaSpec.name,
          version: versionRange,
        };

        // extract releases
        const releases = Object.keys(packumentResponse.versions || {}).sort(compareLoose);

        // extract prereleases from dist tags
        const distTags = packumentResponse['dist-tags'] || {};
        const prereleases = VersionHelpers.filterPrereleasesFromDistTags(
          distTags
        ).sort(compareLoose)

        const response = {
          source: ClientResponseSource.remote,
          status: 200,
        };

        // check if the version requested is a tag. eg latest|next
        const requested = request.package;
        if (npaSpec.type === NpaTypes.Tag) {
          versionRange = distTags[requested.version];
          if (!versionRange) {
            return DocumentFactory.createNoMatch(
              providerName,
              source,
              type,
              requested,
              response,
              // suggest the latest release if available
              releases.length > 0 ? releases[releases.length - 1] : null
            );
          }
        }

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
          suggestions,
        };

      }).then(document => {
        this.createCachedResponse(
          cacheKey,
          200,
          document,
          false
        );
        return document;
      }).catch(response => {
        this.createCachedResponse(
          cacheKey,
          response.code,
          response.message,
          true
        );
        return Promise.reject(
          NpmUtils.convertNpmErrorToResponse(
            response,
            ClientResponseSource.remote
          )
        );
      });

  }

}