import {
  AbstractClientRequest,
  ClientResponseSource,
  ProcessClientResponse,
  IProcessClientRequest,
  ICachingOptions
} from "core/clients";

export class ProcessClientRequest
  extends AbstractClientRequest<string, string>
  implements IProcessClientRequest {

  constructor(options: ICachingOptions) {
    super(options);
  }

  async request(
    cmd: string,
    args: Array<string>,
    cwd: string,
  ): Promise<ProcessClientResponse> {

    const cacheKey = `${cmd} ${args.join(' ')}`;

    if (this.cache.options.duration > 0 && this.cache.hasExpired(cacheKey) === false) {
      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) return Promise.reject(cachedResp);
      return Promise.resolve(cachedResp);
    }

    const ps = require('@npmcli/promise-spawn');
    return ps(cmd, args, { cwd, stdioString: true })
      .then(result => {
        // {code === 0, signal === null, stdout, stderr, and all the extras}
        return this.createCachedResponse(
          cacheKey,
          result.code,
          result.stdout,
          false,
          ClientResponseSource.local
        );
      }).catch(error => {
        const result = this.createCachedResponse(
          cacheKey,
          error.code,
          error.message,
          true,
          ClientResponseSource.local
        );
        return Promise.reject<ProcessClientResponse>(result);
      });

  }

}