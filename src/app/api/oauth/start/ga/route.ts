import { NextResponse } from "next/server";
import { randomString, sha256 } from "@/lib/auth/pkce";
import { setEncryptedCookie } from "@/lib/auth/cookies";
import { baseURL } from "@/constants/url";

export async function GET() {
  const state = crypto.randomUUID();
  const codeVerifier = randomString(64);
  const codeChallenge = await sha256(codeVerifier);

  const googleScopes = "https://www.googleapis.com/auth/analytics.readonly  ";

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${baseURL}/api/oauth/callback/ga`,
    response_type: "code",
    scope: googleScopes,
    access_type: "offline",
    prompt: "consent",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const res = NextResponse.redirect(authUrl, { status: 302 });

  await setEncryptedCookie(
    res,
    "oauth_tmp",
    { state, codeVerifier },
    10 * 60,
    "/api/oauth/callback/ga"
  );

  return res;
}
