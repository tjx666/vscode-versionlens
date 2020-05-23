// pacoteClientApi tests
import * as PacoteApiClient from './pacoteClient/pacoteClient.tests';
import * as PacoteNpmRc from './pacoteClient/npmrc.tests';
export const PacoteApiClientTests = {
  PacoteApiClient,
  PacoteNpmRc,
}

import * as fetchRegistry from './npmPackageClient/fetchRegistry.tests';
import * as fetchDirectory from './npmPackageClient/fetchDirectory.tests';
import * as fetchGithub from './npmPackageClient/fetchGithub.tests';
import * as fetchGit from './npmPackageClient/fetchGit.tests';

export const NpmPackageClientTests = {
  fetchRegistry,
  fetchDirectory,
  fetchGithub,
  fetchGit
}

import * as replaceGitVersion from './npmVersionUtils/replaceGitVersion.tests'
export const NpmVersionUtilsTests = {
  replaceGitVersion,
}