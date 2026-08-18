// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Balance extends APIResource {
  /**
   * Get OREBOT Credit balance
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Agent balance
   *
   * @example
   * ```ts
   * await client.balance.listAgent();
   * ```
   */
  listAgent(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/v1/balance', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}
