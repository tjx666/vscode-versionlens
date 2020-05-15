export enum ClientResponseSource {
  remote = 'remote',
  cache = 'cache',
  local = 'local'
}

export type ClientResponse<TStatus, TData> = {
  source: ClientResponseSource;
  status: TStatus;
  data: TData;
}

export type HttpClientResponse = ClientResponse<number, string>;