"use client";

import { Card } from "@/components/ui/card";
import { getSession } from "@/utils/get-session";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Chat() {
  const { push } = useRouter();
  const handleCreateChat = async () => {
    const request = await fetch("/api/chat", {
      method: "POST",
    });

    const data = await request.json();

    push(`/chat/${data.id}`);
  };

  return (
    <Card className="w-2xl h-full border p-0 shadow-none overflow-hidden gap-0 rounded-r-xl flex flex-col items-center justify-center text-gray-800">
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
