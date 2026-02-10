import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/utils/get-session.server";
import { httpRequest } from "@/utils/http-request";
import { NextResponse } from "next/server";

const getToken = async (refresh_token: string): Promise<string> => {
  const params = JSON.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: params,
  });

  const token = (await res.json()).access_token;

  return token;
};

interface GoogleAccountsResponse {
  accountSummaries: Array<{
    propertySummaries: Array<{
      property: string;

      parent: string;

      displayName: string;
    }>;
  }>;
}

export const GET = async (req: Request) => {
  const session = await getSessionServer();

  const getIntegration = await prisma.integration.findFirst({
    where: {
      userId: session.id,
      provider: "ga",
    },
  });

  const refresh_token = JSON.parse(
    getIntegration?.credentials ?? ""
  ).refresh_token;

  if (!getIntegration) return NextResponse.json({ message: "not found" });

  const { data: accountData } = await httpRequest<GoogleAccountsResponse, null>(
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
    {
      params: {
        pageSize: "2000",
      },
      headers: {
        Authorization: `Bearer ${await getToken(refresh_token)}`,
      },
    }
  );

  const prop: Array<Record<string, string | undefined>> = [];

  for (let i = 0; i < accountData?.accountSummaries?.length! || 0; i++) {
    const e = accountData?.accountSummaries[i];

    for (let ii = 0; ii < e?.propertySummaries?.length! || 0; ii++) {
      const element = e?.propertySummaries[ii];

      prop.push({
        id: element?.property,

        name: element?.displayName,

        parent: element?.parent,
      });
    }
  }

  return NextResponse.json({ data: prop });
};
