// File generated from our OpenAPI spec by Scalar. See README.md for details.

import { APIResource } from '../../resource';
import { APIPromise } from '../../api-promise';
import type { RequestOptions } from '../../internal/request-options';
import * as TopupAPI from './topup';
import { Topup, type TopupFiveParams, type TopupTwentyParams, type TopupOneHundredParams } from './topup';

export class Credits extends APIResource {
  topup: TopupAPI.Topup = new TopupAPI.Topup(this._client);
}

Credits.Topup = Topup;

export declare namespace Credits {
  export {
    Topup as Topup,
    type TopupFiveParams as TopupFiveParams,
    type TopupTwentyParams as TopupTwentyParams,
    type TopupOneHundredParams as TopupOneHundredParams,
  };
}
