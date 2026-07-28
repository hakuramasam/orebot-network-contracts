import { client } from "./client";

const THIRDWEB_API = "https://api.thirdweb.com";

export type AuthInitiateResponse = {
  nonce: string;
  walletAddress?: string;
};

export type AuthCompleteResponse = {
  token: string;
  walletAddress: string;
};

export type SocialAuthProviders = "google" | "x" | "farcaster";

/**
 * Initiate authentication. The response contains a nonce for SIWE
 * or a redirect URL for social OAuth.
 */
export async function initiateAuth(payload: {
  domain: string;
  address?: string;
  redirectUrl?: string;
  provider?: SocialAuthProviders;
}): Promise<AuthInitiateResponse> {
  const resp = await fetch(`${THIRDWEB_API}/v1/auth/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain: payload.domain,
      address: payload.address,
      redirectUrl: payload.redirectUrl,
      provider: payload.provider,
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Auth initiate failed: ${await resp.text()}`);
  }
  return resp.json();
}

/**
 * Complete authentication with a signed payload.
 */
export async function completeAuth(payload: {
  nonce: string;
  signature: string;
  address: string;
}): Promise<AuthCompleteResponse> {
  const resp = await fetch(`${THIRDWEB_API}/v1/auth/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nonce: payload.nonce,
      signature: payload.signature,
      address: payload.address,
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    }),
  });
  if (!resp.ok) {
    throw new Error(`Auth complete failed: ${await resp.text()}`);
  }
  return resp.json();
}

/**
 * Get the social OAuth redirect URL for thirdweb hosted auth.
 */
export function getSocialAuthUrl(
  provider: SocialAuthProviders,
  redirectUrl: string
): string {
  return `${THIRDWEB_API}/v1/auth/social?provider=${provider}&redirectUrl=${encodeURIComponent(redirectUrl)}&clientId=${process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}`;
}
