import { FetchRequest, FetchResponse, FetchError } from '../models/fetch';

export function createFetchError(request: FetchRequest, response: FetchResponse, data: any): FetchError {
  return {
    request,
    response,
    data
  };
}