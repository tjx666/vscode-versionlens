export enum HttpResponseSources {
  remote = 'remote',
  cache = 'cache',
  local = 'local'
}

export type HttpResponse = {
  source: HttpResponseSources;
  status: number;
  responseText: string;
};

export type JsonHttpResponse = {
  source: HttpResponseSources,
  status: number,
  data: any
}
