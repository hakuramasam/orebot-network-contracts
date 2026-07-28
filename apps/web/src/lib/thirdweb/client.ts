import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";

if (!clientId) {
  console.warn("NEXT_PUBLIC_THIRDWEB_CLIENT_ID not set — wallet features will be disabled. Set it in .env.local");
}

export const client = createThirdwebClient({
  clientId: clientId || "placeholder",
});
