// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import { buildHeaders } from '../../internal/headers';

export class Topup extends APIResource {
  /**
   * Preview x402 credit tiers
   *
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Credit tiers
   *
   * @example
   * ```ts
   * await client.credits.topup.preview();
   * ```
   */
  preview(options?: RequestOptions): APIPromise<void> {
    return this._client.get('/v1/credits/topup/preview', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Buy 50 Credits for $5 via x402
   *
   * @param {TopupFiveParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Credits purchased
   *
   * @example
   * ```ts
   * await client.credits.topup.five({
   *   'Idempotency-Key': 'idempotencyKey',
   * });
   * ```
   */
  five(params: TopupFiveParams, options?: RequestOptions): APIPromise<void> {
    const { 'Idempotency-Key': idempotencyKey } = params;
    return this._client.post('/v1/credits/topup/5', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', 'Idempotency-Key': idempotencyKey }, options?.headers]),
    });
  }

  /**
   * Buy 200 Credits for $20 via x402
   *
   * @param {TopupTwentyParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Credits purchased
   *
   * @example
   * ```ts
   * await client.credits.topup.twenty({
   *   'Idempotency-Key': 'idempotencyKey',
   * });
   * ```
   */
  twenty(params: TopupTwentyParams, options?: RequestOptions): APIPromise<void> {
    const { 'Idempotency-Key': idempotencyKey } = params;
    return this._client.post('/v1/credits/topup/20', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', 'Idempotency-Key': idempotencyKey }, options?.headers]),
    });
  }

  /**
   * Buy 1000 Credits for $100 via x402
   *
   * @param {TopupOneHundredParams} params - The parameters to send with the request.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Credits purchased
   *
   * @example
   * ```ts
   * await client.credits.topup.oneHundred({
   *   'Idempotency-Key': 'idempotencyKey',
   * });
   * ```
   */
  oneHundred(params: TopupOneHundredParams, options?: RequestOptions): APIPromise<void> {
    const { 'Idempotency-Key': idempotencyKey } = params;
    return this._client.post('/v1/credits/topup/100', {
      ...options,
      headers: buildHeaders([{ Accept: '*/*', 'Idempotency-Key': idempotencyKey }, options?.headers]),
    });
  }
}

export interface TopupFiveParams {
  'Idempotency-Key': string;
}

export interface TopupTwentyParams {
  'Idempotency-Key': string;
}

export interface TopupOneHundredParams {
  'Idempotency-Key': string;
}
export declare namespace Topup {
  export {
    type TopupFiveParams as TopupFiveParams,
    type TopupTwentyParams as TopupTwentyParams,
    type TopupOneHundredParams as TopupOneHundredParams,
  };
}
