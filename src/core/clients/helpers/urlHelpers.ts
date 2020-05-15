export enum RegistryProtocols {
  file = 'file:',
  https = 'https:',
}

export function getProtocolFromUrl(url: string): RegistryProtocols {
  const { parse } = require('url');
  const sourceUrl = parse(url);
  return (sourceUrl.protocol !== RegistryProtocols.https) ?
    RegistryProtocols.file :
    RegistryProtocols.https;
}