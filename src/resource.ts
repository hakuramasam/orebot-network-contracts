// File generated from our OpenAPI spec by Scalar. See README.md for details.

import type { OrebotAgentGateway } from './client';

export abstract class APIResource {
  protected _client: OrebotAgentGateway;

  constructor(client: OrebotAgentGateway) {
    this._client = client;
  }
}
