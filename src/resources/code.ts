// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';
import type * as ChatAPI from './chat';

export class Code extends APIResource {
  /**
   * Execute coding service
   *
   * @param {CodeAgentCodingParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns Coding response
   *
   * @example
   * ```ts
   * await client.code.agentCoding({
   *   prompt: 'x',
   * });
   * ```
   */
  agentCoding(body: CodeAgentCodingParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/v1/code', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface CodeAgentCodingParams {
  /**
   * @minLength 1
   */
  prompt: string;
  context?: Record<string, unknown>;
}
export declare namespace Code {
  export { type CodeAgentCodingParams as CodeAgentCodingParams };
}
