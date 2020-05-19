import {
  RequestFactory,
  ResponseFactory,
  IPackageDependencyLens,
  PackageClientContext,
  PackageRequest,
  ReplaceVersionFunction,
  IPackageClient,
  PackageSuggestionFlags,
  PackageResponse,
} from 'core/packages';


export async function executeDependencyRequests<TClientData>(
  packagePath: string,
  client: IPackageClient<TClientData>,
  dependencies: Array<IPackageDependencyLens>,
  context: PackageClientContext<TClientData>
): Promise<Array<PackageResponse>> {

  const providerName = client.config.options.providerName;

  const {
    includePrereleases,
    clientData,
    replaceVersion,
  } = context;

  const results = [];
  const promises = dependencies.map(
    function (dependency) {

      // build the client request
      const { name, version } = dependency.packageInfo;
      const clientRequest: PackageRequest<TClientData> = {
        providerName,
        includePrereleases,
        clientData,
        dependency,
        package: {
          name,
          version,
          path: packagePath,
        }
      };

      // execute request
      const promisedDependency = RequestFactory.executePackageRequest(
        client,
        clientRequest,
        replaceVersion
      );

      // flatten responses
      return promisedDependency.then(
        function (responses) {
          if (Array.isArray(responses))
            results.push(...responses)
          else
            results.push(responses);
        }
      );

    }

  );

  return Promise.all(promises).then(_ => results)
}

export async function executePackageRequest<TClientData>(
  client: IPackageClient<TClientData>,
  request: PackageRequest<TClientData>,
  replaceVersionFn: ReplaceVersionFunction,
): Promise<Array<PackageResponse> | PackageResponse> {

  client.logger.debug(`Queued package: %s`, request.package.name);

  return client.fetchPackage(request)
    .then(function (response) {

      client.logger.debug(
        'Fetched package from %s: %s@%s',
        response.response.source,
        request.package.name,
        request.package.version
      );

      if (request.includePrereleases === false) {
        response.suggestions = response.suggestions.filter(
          suggestion => !(suggestion.flags & PackageSuggestionFlags.prerelease)
        )
      }

      return ResponseFactory.createSuccess(request, response, replaceVersionFn);
    })
    .catch(function (error: PackageResponse) {

      client.logger.error(
        `Provider: Function: %s\tPackage: %O\t Error: %j`,
        executePackageRequest.name,
        request.package,
        error
      );

      return Promise.reject(error);
    })
}