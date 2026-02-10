import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface InputUpdateIntegration {
  active?: boolean;
  credentials?: string;
}

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;

    if (!id)
      return NextResponse.json({
        error: "Usuário não encontrado",
        success: false,
      });

    const body: InputUpdateIntegration = await req.json();

    const getIntegration = await prisma.integration.findFirst({
      where: {
        id,
      },
    });

    const alreadyCredentials = JSON.parse(getIntegration?.credentials ?? "");

    if (!getIntegration)
      await prisma.integration.update({
        where: {
          id,
        },
        data: {
          active: body.active,
          credentials: JSON.stringify({
            ...alreadyCredentials,
            ...(body.credentials && { ...JSON.parse(body.credentials) }),
          }),
        },
      });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
};
