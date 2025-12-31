import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export interface InputChat {
  userId: string;
}
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InputChat;

    const chat = await prisma.chat.create({
      data: {
        user: {
          connect: {
            id: body.userId,
          },
        },
      },
    });

    return NextResponse.json({ data: chat, success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}
