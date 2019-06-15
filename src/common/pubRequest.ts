/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExpiryCacheMap } from "./expiryCacheMap";

class PubRequest {
  cache: ExpiryCacheMap;
  headers: { referer: string };
  constructor() {
    this.cache = new ExpiryCacheMap();
    this.headers = {
      referer: "https://pub.dev/packages"
    };
  }

  async httpGet(packageName: string): Promise<any> {
    const url = this.generatePubUrl(packageName);
    try {
      return this.request("GET", packageName);
    } catch (error) {
      // handles any 404 errors during a request for the latest release
      if (error.status === 404) {
        return this.cache.set(url, null);
      }
      // check if the request was not found and report back
      error.resourceNotFound = error.status =
        404 && error.data.message.includes("Not Found");
      // check if we have exceeded the rate limit
      error.rateLimitExceeded = error.status =
        403 && error.data.message.includes("API rate limit exceeded");
      // check if bad credentials were given
      error.badCredentials = error.status =
        403 && error.data.message.includes("Bad credentials");
      // reject all other errors
      return Promise.reject(error);
    }
  }

  request(method: string | "GET", packageName: string): Promise<any> {
    const url = this.generatePubUrl(packageName);
    const cacheKey = method + "_" + url;

    if (this.cache.expired(url) === false) {
      return Promise.resolve(this.cache.get(cacheKey));
    }
    const requestLight = require("request-light");
    return requestLight
      .xhr({ url, type: method, headers: this.headers })
      .then(response => {
        if (response && response.responseText) {
          const value = JSON.parse(response.responseText);
          this.cache.set(cacheKey, value);
          return Promise.resolve(value);
        } else {
          return Promise.reject({
            status: response.status,
            data: this.cache.set(cacheKey, null)
          });
        }
      })
      .catch(response => {
        return Promise.reject({
          status: response.status,
          data: this.cache.set(cacheKey, null)
        });
      });
  }

  generatePubUrl(packageName: string): string {
    return `https://pub.dev/api/documentation/${packageName}`;
  }
}

export const pubRequest = new PubRequest();
