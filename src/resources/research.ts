// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';
import type * as ChatAPI from './chat';

export class Research extends APIResource {
  /**
   * Execute research service
   *
   * @param {ResearchAgentParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Research response
   *
   * @example
   * ```ts
   * await client.research.agent({
   *   prompt: 'x',
   * });
   * ```
   */
  agent(body: ResearchAgentParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/v1/research', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface ResearchAgentParams {
  /**
   * @minLength 1
   */
  prompt: string;
  context?: Record<string, unknown>;
}
export declare namespace Research {
  export { type ResearchAgentParams as ResearchAgentParams };
}
