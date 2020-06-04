import { ILogger } from "core.logging";
import { IProviderConfig } from "core.providers";
import {
  PackageResponse,
  IPackageDependency,
  ReplaceVersionFunction
} from "core.packages";

export interface ISuggestionProvider {

  config: IProviderConfig;

  logger: ILogger;

  suggestionReplaceFn: ReplaceVersionFunction;

  parseDependencies(packageText: string): Array<IPackageDependency>;

  fetchSuggestions(
    packagePath: string,
    packageDependencies: Array<IPackageDependency>
  ): Promise<Array<PackageResponse>>;

}