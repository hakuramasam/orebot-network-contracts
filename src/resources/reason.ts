// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';
import type * as ChatAPI from './chat';

export class Reason extends APIResource {
  /**
   * Execute reasoning service
   *
   * @param {ReasonAgentParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns AI response
   *
   * @example
   * ```ts
   * await client.reason.agent({
   *   prompt: 'x',
   * });
   * ```
   */
  agent(body: ReasonAgentParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/v1/reason', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface ReasonAgentParams {
  /**
   * @minLength 1
   */
  prompt: string;
  context?: Record<string, unknown>;
}
export declare namespace Reason {
  export { type ReasonAgentParams as ReasonAgentParams };
}
