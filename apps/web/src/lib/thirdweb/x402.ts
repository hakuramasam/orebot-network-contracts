import { settlePayment as sdkSettlePayment, facilitator } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { base } from "thirdweb/chains";

/**
 * x402 Payment helpers using the thirdweb SDK's facilitator and settlePayment.
 * Base Mainnet, ORE token, exact scheme, confirmed settlement.
 *
 * ORE token: 0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD (18 decimals)
 */

export const SERVER_WALLET_ADDRESS = process.env.SERVER_WALLET_ADDRESS || "0x9ad133aDDba94A95320126d8784d484943130115";
export const ORE_TOKEN_ADDRESS = "0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD";
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || "";

const client = createThirdwebClient({ secretKey: THIRDWEB_SECRET_KEY });

export const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: SERVER_WALLET_ADDRESS,
  waitUntil: "confirmed",
});

export type PaymentArgs = {
  resourceUrl: string;
  method: "GET" | "POST";
  paymentData: string | null;
  amount: string;       // ORE token amount in wei (18 decimals)
  description: string;
  mimeType: string;
};

/**
 * Verify and settle an x402 payment in ORE token using the thirdweb SDK.
 * Returns the settled result on success (status 200).
 * On payment failure, returns the 402 response to forward to the client.
 */
export async function processPayment(args: PaymentArgs) {
  return sdkSettlePayment({
    resourceUrl: args.resourceUrl,
    method: args.method,
    paymentData: args.paymentData,
    payTo: SERVER_WALLET_ADDRESS,
    network: base,
    price: {
      amount: args.amount,
      asset: {
        address: ORE_TOKEN_ADDRESS,
      },
    },
    scheme: "exact",
    facilitator: thirdwebFacilitator,
    routeConfig: {
      description: args.description,
      mimeType: args.mimeType,
      maxTimeoutSeconds: 300,
    },
  });
}

/**
 * Extract x402 payment signature from request headers.
 */
export function extractPaymentHeader(request: Request): string | null {
  return (
    request.headers.get("Payment-Signature") ||
    request.headers.get("X-Payment") ||
    request.headers.get("x-payment-signature") ||
    null
  );
}
