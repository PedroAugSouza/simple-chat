import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const id = (await params).userId;

    const settings = await prisma.settings.findFirst({
      where: { userId: id },
    });

    return NextResponse.json({ data: { ...settings }, success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, data: [] });
  }
};

interface PatchBody {
  apiKey?: string;
  model?: string;
}
const models = [
  "claude-sonnet-4-5",
  "claude-sonnet-4-0",
  "claude-3-7-sonnet-latest",
];
export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const id = (await params).userId;

    const body = (await req.json()) as PatchBody;

    if (body.model && !models.includes(body.model)) {
      return NextResponse.json({ success: false, message: "Invalid model" });
    }

    const settings = await prisma.settings.findFirst({
      where: { userId: id },
    });

    await prisma.settings.update({
      where: { id: settings?.id },
      data: {
        apiKey: body.apiKey,
        model: body.model,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false });
  }
};
