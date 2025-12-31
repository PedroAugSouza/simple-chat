import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;

    const chats = await prisma.chat.findMany({
      where: {
        userId,
      },
    });

    return NextResponse.json({ data: chats, success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}
