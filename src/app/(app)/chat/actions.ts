"use server";

import { prisma } from "@/lib/prisma";
import { MyUIMessage } from "@/types";
import { getSessionServer } from "@/utils/get-session.server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createChat(userId?: string) {
  const session = await getSessionServer();
  const id = userId || session?.id;

  if (!id) {
    throw new Error("Unauthorized");
  }

  const chat = await prisma.chat.create({
    data: {
      user: {
        connect: {
          id,
        },
      },
    },
  });

  revalidatePath("/chat");
  redirect(`/chat/${chat.id}`);
}

export async function getChat(chatId: string) {
  try {
    const session = await getSessionServer();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    // Verify ownership
    if (chat.userId !== session.id) {
      return { success: false, error: "Unauthorized" };
    }

    return {
      success: true,
      data: {
        id: chat.id,
        name: chat.name,
        messages: [
          ...chat.messages.map(({ metadata, ...message }) => ({
            parts: JSON.parse(message.text),
            ...(metadata && { metadata: JSON.parse(metadata) }),
            ...message,
          })),
        ] as MyUIMessage[],
      },
    };
  } catch (error) {
    console.error("Error getting chat:", error);
    return { success: false, error: "Failed to load chat" };
  }
}

const updateChatSchema = z.object({
  name: z.string().optional(),
});

export async function updateChat(chatId: string, data: { name?: string }) {
  try {
    const session = await getSessionServer();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate ownership before update
    const existingChat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { userId: true },
    });

    if (!existingChat || existingChat.userId !== session.id) {
      return { success: false, error: "Unauthorized or chat not found" };
    }

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        name: data.name,
      },
    });

    revalidatePath(`/chat/${chatId}`);
    revalidatePath("/chat"); // Revalidate list if name changed
    return { success: true };
  } catch (error) {
    console.error("Error updating chat:", error);
    return { success: false, error: "Failed to update chat" };
  }
}

export async function deleteChat(chatId: string) {
  const session = await getSessionServer();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Validate ownership before delete
  const existingChat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { userId: true },
  });

  if (!existingChat || existingChat.userId !== session.id) {
    throw new Error("Unauthorized or chat not found");
  }

  await prisma.chat.delete({
    where: { id: chatId },
  });

  revalidatePath("/chat");
  redirect("/chat");
}

export async function logout() {
  const store = await cookies();
  store.delete("token");
  redirect("/login");
}
