import {
  ProcessClientRequest,
} from 'core/clients';

import { DotNetSource } from '../definitions';


export class DotNetClient extends ProcessClientRequest {

  constructor(cacheDuration) {
    super(cacheDuration)
  }

  async fetchSources(cwd: string): Promise<Array<DotNetSource>> {
    const promised = super.request(
      'dotnet',
      ['nuget', 'list', 'source', '--format', 'short'],
      cwd
    );

    return promised.then(result => {
      const { data } = result;

      // reject when data contains "error"
      if (data.indexOf("error") > -1) return Promise.reject(result);

      // check we have some data
      if (data.length === 0 || data.indexOf('E') === -1) {
        return [];
      }

      // extract sources
      const hasCrLf = data.indexOf(crLf) > 0;
      const splitChar = hasCrLf ? crLf : '\n';
      let lines = data.split(splitChar);
      if (lines[lines.length - 1] === '') lines.pop();
      return parseSourcesArray(lines);
    })
  }

}


const crLf = '\r\n';
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