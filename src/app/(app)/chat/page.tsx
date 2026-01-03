"use client";

import { Card } from "@/components/ui/card";
import { chatService } from "@/services/chat";
import { getSession } from "@/utils/get-session";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

export default function Chat() {
  const { push } = useRouter();

  const session = getSession();

  const sessionId = session?.id;

  const handleCreateChat = async () => {
    const id = await chatService.create(sessionId ?? "");

    mutate("get-chats");
    push(`/chat/${id}`);
  };

  return (
    <Card className="w-full h-full border p-0 shadow-none overflow-hidden gap-0 rounded-r-xl flex flex-col items-center justify-center text-gray-800">
      <span>
        <Sparkles size={44} strokeWidth={1.5} />
      </span>
      <button
        onClick={handleCreateChat}
        className="border border-gray-500 rounded-full text-lg font-medium py-2 px-3 mt-6 cursor-pointer"
      >
        Converse com o chat!
      </button>
    </Card>
  );
}
