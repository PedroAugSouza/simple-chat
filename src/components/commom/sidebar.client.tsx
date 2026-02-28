"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Plus, EllipsisVertical, BookText, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { createChat, deleteChat, logout } from "@/app/(app)/chat/actions";
import { OrbMindIcon } from "@/components/commom/orbmind-icon";
import { useTransition } from "react";

interface SidebarClientProps {
  initialChats: {
    id: string;
    name: string | null;
    createdAt: Date;
  }[];
  userId: string;
}

export const SidebarClient = ({ initialChats, userId }: SidebarClientProps) => {
  const pathname = usePathname();
  const [isCreating, startCreateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const handleCreateChat = () => {
    startCreateTransition(() => createChat(userId));
  };

  const handleDeleteChat = (chatId: string) => {
    startDeleteTransition(() => deleteChat(chatId));
  };

  const handleLogout = () => {
    startLogoutTransition(() => logout());
  };

  return (
    <aside className="h-full flex flex-col border-r border-zinc-300 w-72 bg-white p-3 overflow-hidden">
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <OrbMindIcon className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-tight">
          OrbMind
        </span>
      </div>

      <Separator className="mb-3 opacity-50" />

      <Link
        href="/collection"
        className="flex items-center justify-start gap-2 py-2 px-3 hover:bg-accent/50 transition-colors cursor-pointer rounded-md text-sm text-muted-foreground hover:text-foreground"
      >
        <BookText size={16} />
        <span>Meu Acervo</span>
      </Link>

      <button
        onClick={handleCreateChat}
        disabled={isCreating}
        className="flex items-center justify-start gap-2 py-2 px-3 hover:bg-accent/50 transition-colors cursor-pointer rounded-md text-sm mt-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <Plus size={16} />
        <span>{isCreating ? "Criando..." : "Nova Conversa"}</span>
      </button>

      <div className="mt-4 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Histórico
      </div>

      <ul className="flex flex-col w-full flex-1 overflow-auto mt-2 space-y-0.5">
        {initialChats?.map((chat) => (
          <Tooltip key={chat.id} delayDuration={1000}>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between group hover:bg-accent/50 rounded-md px-2 py-1.5 w-full transition-colors">
                <Link
                  href={`/chat/${chat.id}`}
                  className="flex-1 text-sm truncate text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  {chat.name || "Nova Conversa"}
                </Link>

                <Popover>
                  <PopoverTrigger className="text-muted-foreground/0 group-hover:text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all p-1 rounded-sm hover:bg-background">
                    <EllipsisVertical size={14} />
                  </PopoverTrigger>
                  <PopoverContent className="p-1 w-32" align="end">
                    <button
                      className="w-full flex items-center px-2 py-1.5 rounded-sm text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      Excluir
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {chat.name || "Nova Conversa"}
            </TooltipContent>
          </Tooltip>
        ))}
      </ul>

      <Separator className="my-2 opacity-50" />

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 py-2 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50"
      >
        <LogOut size={16} />
        <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
      </button>
    </aside>
  );
};
