// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Health extends APIResource {
  /**
   * Gateway health
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns OK
   *
   * @example
   * ```ts
   * await client.health.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/health', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}
