import { NextResponse } from "next/server";
import { getEncryptedCookie, setEncryptedCookie } from "@/lib/auth/cookies";
import { baseURL } from "@/constants/url";
import { getSessionServer } from "@/utils/get-session.server";
import { prisma } from "@/lib/prisma";

async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: `${baseURL}/api/oauth/callback/ga`,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!resp.ok) {
    throw new Error(`Token endpoint erro ${resp.status}: ${await resp.text()}`);
  }
  return resp.json() as Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: "Bearer";
    id_token?: string;
  }>;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const tmp = await getEncryptedCookie<{ state: string; codeVerifier: string }>(
    "oauth_tmp"
  );

  if (!code || !state || !tmp || tmp.state !== state) {
    return new NextResponse("Invalid state/flow", { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code, tmp.codeVerifier);

    const session = await getSessionServer();
    await prisma.integration.create({
      data: {
        provider: "ga",
        credentials: JSON.stringify({ refresh_token: tokens.refresh_token }),
        active: true,
        user: {
          connect: {
            id: session.id,
          },
        },
      },
    });

    const redirect = new URL("/chat/settings", req.url);

    const res = NextResponse.redirect(redirect);
    if (tokens.refresh_token) {
      await setEncryptedCookie(
        res,
        "ga4_rt",
        { refresh_token: tokens.refresh_token },
        180 * 24 * 60 * 60
      );
    }
    // limpa cookie temporário
    res.cookies.set({
      name: "oauth_tmp",
      value: "",
      maxAge: 0,
      path: "/api/auth/google",
    });
    return res;
  } catch (e: unknown) {
    return new NextResponse("OAuth error", {
      status: 500,
    });
  }
}
