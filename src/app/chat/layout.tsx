"use client";
import { Separator } from "@/components/ui/separator";

import useSWR from "swr";

import { ArrowLeft, Cog, EllipsisVertical, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { chatService } from "@/services/chat";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { getSession } from "@/utils/get-session";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { push, back } = useRouter();

  const pathname = usePathname();

  const session = getSession();

  const sessionId = session?.id;

  const { data: chats, mutate } = useSWR("get-chats", async () => {
    const chats = await chatService.getMany(sessionId!);
    return chats;
  });

  const handleCreateChat = async () => {
    const id = await chatService.create(sessionId ?? "");

    mutate();
    push(`/chat/${id}`);
  };

  return (
    <main className="h-screen grid place-items-center">
      <section className="flex flex-row h-204">
        <aside className="h-full flex flex-col border border-r-transparent w-72 rounded-l-xl p-2 overflow-hidden">
          {pathname !== "/chat/settings" ? (
            <>
              <button
                onClick={handleCreateChat}
                className="flex items-center justify-start gap-2 py-2 px-4 hover:bg-gray-100 cursor-pointer rounded-md text-sm mb-1"
              >
                <Plus size={16} />
                <span>Criar chat</span>
              </button>
              <Separator />
              <ul className="flex flex-col w-full flex-1">
                {chats?.data?.map((chat) => (
                  <li
                    key={chat.id}
                    className="flex flex-row justify-between group hover:bg-gray-100 rounded-md py-1 px-2 first:mt-2"
                  >
                    <Link
                      href={`/chat/${chat.id}`}
                      className="cursor-pointer rounded-l-md w-full pl-2 text-foreground truncate"
                      title={chat.name}
                    >
                      {chat.name}
                    </Link>

                    <Popover>
                      <PopoverTrigger className="text-zinc-600 cursor-pointer">
                        <EllipsisVertical size={18} />
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-2 rounded-lg w-28 bg-background/80 backdrop-blur-[2px] flex flex-col"
                        side="right"
                      >
                        <button
                          className="w-full flex items-start p-1 rounded cursor-pointer text-foreground text-sm hover:bg-accent/60"
                          onClick={() => {
                            chatService.delete(chat.id).then(() => {
                              const chatId = pathname.split("/")[2];
                              if (chatId === chat.id) {
                                push("/chat");
                              }
                              mutate();
                            });
                          }}
                        >
                          Exluir
                        </button>
                      </PopoverContent>
                    </Popover>
                  </li>
                ))}
              </ul>
              <Link
                href="/chat/settings"
                className="flex items-center justify-center gap-2 p-2 px-4 bg-gray-100 cursor-pointer rounded-md text-gray-800"
              >
                <Cog size={18} />
                <span>Configurações</span>
              </Link>
            </>
          ) : (
            <>
              <button
                className="flex items-center justify-start gap-2 py-2 px-4 hover:bg-gray-100 cursor-pointer rounded-md text-sm mb-1"
                onClick={back}
              >
                <ArrowLeft size={18} />
                <span>Voltar</span>
              </button>
              <Separator />
              <ul className="flex flex-col w-full flex-1">
                <Link
                  href="#models"
                  className="flex items-start justify-start py-1 px-4 first:mt-2 hover:bg-gray-100 cursor-pointer rounded-md flex-col"
                >
                  Modelo
                </Link>
              </ul>
            </>
          )}
        </aside>
        {children}
      </section>
    </main>
  );
}
