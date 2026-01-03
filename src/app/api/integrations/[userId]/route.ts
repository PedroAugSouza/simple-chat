import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const mapIntegrations = new Map();

mapIntegrations.set("github", {
  name: "Github",
  oauthLink: "/api/oauth/start/github",
  authorized: false,
  description:
    "Conecte seu github para uma melhor gestão dos seus projetos e revisão de código.",
  icon: "github",
});

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const userId = (await params).userId;

    if (!userId)
      return NextResponse.json({
        success: false,
        error: "Usuário deu negativo.",
      });

    const integrations = await prisma.integration.findMany({
      where: {
        userId,
      },
    });

    for (const integration of integrations) {
      const findPlatform = mapIntegrations.get(integration.provider);

      mapIntegrations.set(integration.provider, {
        ...findPlatform,
        integrationId: integration.id,
        active: integration.active,
        authorized: true,
        credentials: integration.credentials,
      });
    }

    const platforms = Array.from(mapIntegrations.values());

    return NextResponse.json({ data: platforms, success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
};
