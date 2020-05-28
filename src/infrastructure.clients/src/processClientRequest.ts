import {
  AbstractClientRequest,
  ClientResponseSource,
  ProcessClientResponse,
  IProcessClientRequest,
  ICachingOptions
} from 'core.clients';
import { ILogger } from 'core.logging';

export class ProcessClientRequest
  extends AbstractClientRequest<string, string>
  implements IProcessClientRequest {

  logger: ILogger;

  constructor(options: ICachingOptions, logger: ILogger) {
    super(options);
    this.logger = logger;
  }

  async request(
    cmd: string, args: Array<string>, cwd: string
  ): Promise<ProcessClientResponse> {

    const cacheKey = `${cmd} ${args.join(' ')}`;

    if (this.cache.options.duration > 0 && this.cache.hasExpired(cacheKey) === false) {
      this.logger.debug('cached - %s', cacheKey);

      const cachedResp = this.cache.get(cacheKey);
      if (cachedResp.rejected) return Promise.reject(cachedResp);
      return Promise.resolve(cachedResp);
    }

    this.logger.debug('executing - %s', cacheKey);
    const ps = require('@npmcli/promise-spawn');
    return ps(cmd, args, { cwd, stdioString: true })
      .then(result => {
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