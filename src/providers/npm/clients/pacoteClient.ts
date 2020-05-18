import {
  DocumentFactory,
  ResponseFactory,
  PackageRequest,
  SuggestionFactory,
  VersionHelpers,
  PackageDocument,
  PackageVersionTypes,
  PackageSourceTypes
} from 'core/packages';
import { ILogger } from 'core/logging';
import { ClientResponseSource } from "core/clients";
import { NpmConfig } from '../npmConfig';
import { NpaSpec, NpaTypes } from '../models/npaSpec';

export class PacoteClient {

  config: NpmConfig;

  constructor(config: NpmConfig, logger: ILogger) {
    this.config = config;
  }

  async fetchPackage(
    request: PackageRequest<null>,
    npaSpec: NpaSpec
  ): Promise<PackageDocument> {
    return createPacotePackageDocument(request, npaSpec)
  }

}

async function createPacotePackageDocument(
  request: PackageRequest<null>,
  npaSpec: NpaSpec
): Promise<PackageDocument> {

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
      const prereleases = VersionHelpers.filterPrereleasesFromDistTags(
        packumentResponse['dist-tags'] || {}
      ).sort(compareLoose)

      const response = {
        source: ClientResponseSource.remote,
        status: 200,
      };

      // check if the version requested is a tag. eg latest|next
      const requested = request.package;
      const distTags = packumentResponse['dist-tags'] || {};
      if (npaSpec.type === NpaTypes.Tag) {
        versionRange = distTags[requested.version];
        if (!versionRange) return DocumentFactory.createNoMatch(
          providerName,
          source,
          type,
          requested,
          response,
          // suggest the latest release if available
          releases.length > 0 ? releases[releases.length - 1] : null
        );
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

    }).catch(error => {
      const response = {
        source: ClientResponseSource.remote,
        data: error.message,
        status: error.code
      };
      return Promise.reject(
        ResponseFactory.createUnexpected(
          request.providerName,
          request.package,
          response,
        )
      );
    });
}