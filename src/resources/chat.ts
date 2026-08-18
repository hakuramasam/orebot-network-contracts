// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../resource';
import { APIPromise } from '../api-promise';
import type { RequestOptions } from '../internal/request-options';
import { buildHeaders } from '../internal/headers';

export class Chat extends APIResource {
  /**
   * Execute basic AI chat
   *
   * @param {ChatAgentParams} body - The request body to send.
   * @param {RequestOptions} [options] - Options to apply to the request, such as headers and an abort signal.
   * @returns AI response
   *
   * @example
   * ```ts
   * await client.chat.agent({
   *   prompt: 'x',
   * });
   * ```
   */
  agent(body: ChatAgentParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/v1/chat', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface PromptRequest {
  /**
   * @minLength 1
   */
  prompt: string;
  context?: Record<string, unknown>;
}

export interface ChatAgentParams {
  /**
   * @minLength 1
   */
  prompt: string;
  context?: Record<string, unknown>;
}
export declare namespace Chat {
  export { type PromptRequest as PromptRequest, type ChatAgentParams as ChatAgentParams };
}
