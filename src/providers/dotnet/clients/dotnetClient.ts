import {
  ProcessClientRequest,
  ClientResponse
} from 'core/clients';

import { DotNetSource } from '../definitions';

import DotnetConfig from '../config';

const crLf = '\r\n';

const processRequest = new ProcessClientRequest();

export async function fetchDotNetSources(cwd: string): Promise<Array<DotNetSource>> {
  const promised = processRequest.request(
    'dotnet',
    ['nuget', 'list', 'source', '--format', 'short'],
    cwd
  );

  return promised.then(result => {
    const { data } = result;
    const hasCrLf = data.indexOf(crLf) > 0;
    const splitChar = hasCrLf ? crLf : '\n';
    let lines = data.split(splitChar);
    if (lines[lines.length - 1] === '') lines.pop();
    return parseSourcesArray(lines);
  })
  //.catch((error: ClientResponse<string>) => {
  //   return Promise.reject(error);
  // });
}

function parseSourcesArray(lines: Array<string>): Array<DotNetSource> {
  const url = require('url');
  return lines.map(function (line) {
    const enabled = line.substring(0, 1) === 'E';
    const machineWide = line.substring(1, 2) === 'M';
    const offset = machineWide ? 3 : 2;
    const source = line.substring(offset);
    const sourceUrl = url.parse(source);
    const protocol = (sourceUrl.protocol !== 'https:') ?
      'file:' : 'https:';

    return {
      enabled,
      machineWide,
      source,
      protocol
    };
  });
}