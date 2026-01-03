import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/utils/get-session.server";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const clientId = process.env.GITHUB_CLIENT_ID;

  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  const url = new URL("https://github.com/login/oauth/access_token");

  url.searchParams.set("client_id", clientId ?? "");
  url.searchParams.set("client_secret", clientSecret ?? "");

  url.searchParams.set("code", code ?? "");

  const request = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  const body = await request.json();

  console.log(body);

  /** my access token
   * {
        access_token: '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',
        token_type: 'bearer',
        scope: ''
      }
   *  */

  const session = await getSessionServer();

  await prisma.integration.create({
    data: {
      provider: "github",
      credentials: JSON.stringify(body),
      active: true,
      user: {
        connect: {
          id: session.id,
        },
      },
    },
  });

  const redirect = new URL("/chat/settings", req.url);

  return NextResponse.redirect(redirect);
};
