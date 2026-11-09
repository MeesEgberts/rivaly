import type { AuthConfig } from "convex/server";

// CLERK_JWT_ISSUER_DOMAIN is de "Frontend API URL" van de Clerk-applicatie
// (bijv. https://verb-noun-00.clerk.accounts.dev). Zet hem in het Convex
// dashboard onder Settings → Environment Variables, voor dev én prod.
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
