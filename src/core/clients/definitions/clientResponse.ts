export enum ClientResponseSource {
  remote = 'remote',
  cache = 'cache',
  local = 'local'
}

export type ClientResponse<T> = {
  source: ClientResponseSource;
  status: number;
  data: T;
}