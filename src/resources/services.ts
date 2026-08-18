// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Services extends APIResource {
  /**
   * List available agent services
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Service catalog
   *
   * @example
   * ```ts
   * await client.services.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/v1/services', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}
