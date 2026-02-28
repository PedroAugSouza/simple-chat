import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/utils/get-session.server";
import { SidebarClient } from "./sidebar.client";
import { Suspense } from "react";
import { Shimmer } from "../ai-elements/shimmer";

export async function Sidebar() {
  const session = await getSessionServer();

  if (!session) {
    return null;
  }

  const chats = await prisma.chat.findMany({
    where: {
      userId: session.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });

  return (
    <Suspense
      fallback={
        <div className="w-72 border-r p-4">
          <Shimmer>Loading chats...</Shimmer>
        </div>
      }
    >
      <SidebarClient initialChats={chats} userId={session.id} />
    </Suspense>
  );
}
