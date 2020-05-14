import { ClientResponse, ClientResponseSource } from "../definitions/clientResponses";
import { AbstractClientRequest } from "./abstractClientRequest";

export type ProcessClientResponse = ClientResponse<string, string>;

export class ProcessClientRequest extends AbstractClientRequest<string, string> {

  constructor(cacheDuration?: number) {
    super(cacheDuration);
  }

  async request(
    cmd: string,
    args: Array<string>,
    cwd: string,
  ): Promise<ProcessClientResponse> {

    const cacheKey = `${cmd} ${args.join(' ')}`;

    if (this.cache.cacheDuration > 0 && this.cache.hasExpired(cacheKey) === false) {
      return Promise.resolve(this.cache.get(cacheKey));
    }

    const ps = require('@npmcli/promise-spawn');
    return ps(cmd, args, { cwd, stdioString: true })
      .then(result => {
        // {code === 0, signal === null, stdout, stderr, and all the extras}
        return this.createCachedResponse(
          cacheKey,
          result.code,
          result.stdout,
          ClientResponseSource.local
        );
      }).catch(error => {
        const result = this.createCachedResponse(
          cacheKey,
          error.code,
          error.message,
          ClientResponseSource.local
        );
        return Promise.reject<ProcessClientResponse>(result);
      });

  }

}