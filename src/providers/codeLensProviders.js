/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { NpmCodeLensProvider } from './npm/npmCodeLensProvider';
import { JspmCodeLensProvider } from './jspm/jspmCodeLensProvider';
import { BowerCodeLensProvider } from './bower/bowerCodeLensProvider';
import { DubCodeLensProvider } from './dub/dubCodeLensProvider';
import { DotNetCSProjCodeLensProvider } from './dotnet/dotnetCSProjCodeLensProvider';

const codeLensProviders = [
  new NpmCodeLensProvider,
  new JspmCodeLensProvider,
  new BowerCodeLensProvider,
  new DubCodeLensProvider,
  new DotNetCSProjCodeLensProvider
];

export default codeLensProviders;