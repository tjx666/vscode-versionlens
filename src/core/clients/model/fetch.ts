export type FetchRequest = {
  packagePath: string,
  packageName: string,
  packageVersion: string
}

export type FetchResponse = {
  responseText: string;
  status?: number;
  headers?: any;
}

export class FetchError {
  request: FetchRequest;
  response: FetchResponse;
  data?: any;
}

