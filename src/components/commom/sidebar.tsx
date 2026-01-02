"use client";
import { chatService } from "@/services/chat";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Plus, EllipsisVertical, Cog, ArrowLeft } from "lucide-react";
import useSWR, { mutate } from "swr";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/utils/get-session";
import Link from "next/link";
import { Separator } from "../ui/separator";

export const Sidebar = () => {
  const pathname = usePathname();
  const { push, back } = useRouter();

  const session = getSession();

  const sessionId = session?.id;

  const { data } = useSWR("get-chats", async () => {
    const chats = await chatService.getMany(sessionId!);
    return chats;
  });

  const chats = data?.data;

  const handleCreateChat = async () => {
    const id = await chatService.create(sessionId ?? "");

    mutate("get-chats");
    push(`/chat/${id}`);
  };
  return (
    <aside className="h-full flex flex-col border border-r-transparent w-72 rounded-l-xl p-2 overflow-hidden">
      {pathname !== "/chat/settings" ? (
        <>
          <p className="text-2xl font-bold tracking-tighter flex items-center gap-1 px-2 my-1">
            Simpl<span className="w-2 h-2 bg-black rounded-full mt-2"></span>
          </p>
          <Separator />
          <button
            onClick={handleCreateChat}
            className="flex items-center justify-start gap-2 py-2 px-4 hover:bg-gray-100 cursor-pointer rounded-md text-sm mt-1"
          >
            <Plus size={16} />
            <span>Criar chat</span>
          </button>

          <ul className="flex flex-col w-full flex-1">
            {chats?.map((chat) => (
              <li
                key={chat.id}
                className="flex flex-row justify-between group hover:bg-gray-100 rounded-md py-1 px-2 group"
              >
                <Link
                  href={`/chat/${chat.id}`}
                  className="cursor-pointer rounded-l-md w-full pl-2 text-foreground truncate"
                  title={chat.name}
                >
                  {chat.name}
                </Link>

                <Popover>
                  <PopoverTrigger className="text-zinc-600 cursor-pointer group-hover:opacity-100 opacity-0">
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
                          const chatId = pathname?.split("/")[2];
                          if (chatId === chat.id) {
                            push("/chat");
                          }
                          mutate("get-chats");
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
              Perfil
            </Link>
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
  );
};
