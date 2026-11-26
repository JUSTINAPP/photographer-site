import 'server-only';
import crypto from "crypto";

/**
 * Minimal Google service-account OAuth2 flow (RFC 7523 JWT bearer grant) —
 * no `googleapis` dependency, just crypto + fetch, matching this project's
 * pattern of calling external REST APIs directly (see lib/sanity/whats-on.ts).
 * Used by the Search Console integration; reusable for any other
 * service-account-authenticated Google API this dashboard adds later.
 */

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

interface TokenCacheEntry {
  token: string;
  expiresAt: number; // epoch ms
}

// Access tokens are valid for ~1 hour — cache per scope-set for the life of
// the server process so every request doesn't re-mint a fresh JWT and round
// trip to Google's token endpoint.
const tokenCache = new Map<string, TokenCacheEntry>();

export async function getGoogleAccessToken(scopes: string[]): Promise<string | null> {
  const clientEmail = (process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL);
  const rawPrivateKey = (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY);
  if (!clientEmail || !rawPrivateKey || clientEmail.startsWith("your-service-account")) {
    return null;
  }
  // Defensive cleanup for the two most common paste mistakes when copying
  // straight out of the downloaded JSON key file: the surrounding quotes
  // from the "private_key": "..." field, and the trailing comma that came
  // with it. Neither belongs in the actual key. Also converts the literal
  // "\n" sequences env vars carry into real newlines.
  const privateKey = rawPrivateKey
    .trim()
    .replace(/,$/, "")
    .replace(/^"(.*)"$/, "$1")
    .replace(/\\n/g, "\n");

  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY doesn't look like a valid PEM key — check it wasn't truncated or double-escaped when pasted."
    );
  }

  const cacheKey = scopes.join(" ");
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: scopes.join(" "),
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signInput = `${header}.${claims}`;
  let signature: Buffer;
  try {
    signature = crypto.sign("RSA-SHA256", Buffer.from(signInput), privateKey);
  } catch (error) {
    throw new Error(
      `Couldn't sign the JWT with GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY — the key is present but crypto rejected it (${
        error instanceof Error ? error.message : String(error)
      }). Double check it was pasted in full, with no extra quotes or characters added or lost.`
    );
  }
  const jwt = `${signInput}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
      signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    void body; // Do not log provider token responses.
    return null;
  }

  const data: { access_token?: string; expires_in?: number } = await res.json();
  if (!data.access_token) return null;

  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  });
  return data.access_token;
}
