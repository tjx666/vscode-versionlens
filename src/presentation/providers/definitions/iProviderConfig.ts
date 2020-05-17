import { VersionLensExtension } from "presentation/extension";
import { IProviderOptions } from "./iProviderOptions";

export interface IProviderConfig {

  extension: VersionLensExtension;

  options: IProviderOptions;

}