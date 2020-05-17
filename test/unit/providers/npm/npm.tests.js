// pacoteClientApi tests
import * as PacoteApiClient from './pacoteClient/pacoteClient.tests.js';
export const PacoteApiClientTests = {
  PacoteApiClient
}

import * as fetchDirectory from './npmPackageClient/fetchDirectory.tests';
import * as fetchGithub from './npmPackageClient/fetchGithub.tests';
import * as fetchGit from './npmPackageClient/fetchGit.tests';

export const NpmPackageClientTests = {
  fetchDirectory,
  fetchGithub,
  fetchGit
}

import * as replaceGitVersion from './npmVersionUtils/replaceGitVersion.tests'
export const NpmVersionUtilsTests = {
  replaceGitVersion,
}