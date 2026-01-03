import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const chatId = (await params).id;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: chat.id,
        name: chat.name,
        messages: [
          ...chat.messages.map((message) => ({
            parts: JSON.parse(message.text),
            ...message,
          })),
        ],
      },
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}

interface PatchBody {
  name?: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const body = (await req.json()) as PatchBody;

    await prisma.chat.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    await prisma.chat.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}
