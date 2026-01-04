"use client";

import { Card } from "@/components/ui/card";
import { useChat } from "@ai-sdk/react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Send } from "lucide-react";

import { useLayoutEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { DefaultChatTransport } from "ai";
import { Separator } from "@/components/ui/separator";
import { agentsService } from "@/services/agents";
import { chatService } from "@/services/chat";
import { mutate } from "swr";
import { MessageAssistant } from "@/components/commom/message-assistant.chat";
import { MessageUser } from "@/components/commom/message-user.chat";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { usePathname, useRouter } from "next/navigation";
import { MyUIMessage } from "@/types";

const chatSchema = z.object({
  userMessage: z.string().nonempty(),
});

type Form = z.infer<typeof chatSchema>;

export function Chat({
  id,
  initialMessages,
  name,
}: {
  id?: string | undefined;
  initialMessages?: MyUIMessage[];
  name: string;
}) {
  const pathname = usePathname();
  const { push } = useRouter();

  const endRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef<HTMLButtonElement>(null);

  const { messages, sendMessage, status } = useChat<MyUIMessage>({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: `/ai/chat/${id}`,
    }),
    onFinish: async ({ message }) => {
      const lastPart = message.parts[message.parts.length - 1];
      if (lastPart?.type !== "text") return;

      const title = await agentsService.generateTitle({
        message: lastPart.text,
      });

      await chatService.update(id!, {
        name: title,
      });

      mutate("get-chats");
    },
  });

  const { register, handleSubmit, reset } = useForm<Form>({
    resolver: zodResolver(chatSchema),
  });

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const lastMessage = messages[messages.length - 1];

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  return (
    <Card className=" flex-1 border p-2 shadow-none  gap-0 rounded-r-xl flex flex-col items-center justify-between ">
      <header className="w-full  px-4 bg-gray-50 text-gray-800 font-medium mb-1 grid place-items-center">
        <Popover>
          <PopoverTrigger
            ref={titleRef}
            className="h-full py-2 flex items-center gap-2"
          >
            <h1 className="text-sm">{name}</h1>
            <ChevronDown size={18} />
          </PopoverTrigger>
          <PopoverContent
            className="p-2 rounded-lg  bg-background/80 backdrop-blur-[2px] flex flex-col"
            side="bottom"
            style={{ width: titleRef?.current?.clientWidth }}
          >
            <button
              className="w-full flex items-start p-1 rounded cursor-pointer text-foreground text-sm hover:bg-accent/60"
              onClick={() => {
                chatService.delete(id!).then(() => {
                  const chatId = pathname?.split("/")[2];
                  if (chatId === id) {
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
      </header>
      <Separator />

      <section className=" h-full pt-4 3xl:px-62 xl:px-28 lg:px-20 md:px-8 px-2 overflow-auto w-full">
        <AnimatePresence>
          {messages.map((m) => {
            return m.role === "assistant" ? (
              <MessageAssistant
                {...m}
                isLastMessage={lastMessage.id === m.id}
                status={status}
                key={m.id}
              />
            ) : (
              <MessageUser {...m} key={m.id} />
            );
          })}
        </AnimatePresence>

        <div key="end-anchor" ref={endRef} className="h-4 shrink-0" />
      </section>

      <form
        className="w-full py-2  3xl:px-62 xl:px-28 lg:px-20 md:px-8 px-2  flex gap-2"
        onSubmit={handleSubmit((data) => {
          sendMessage({
            text: data.userMessage,
            metadata: {
              createdAt: new Date(),
            },
          });
          reset();
        })}
      >
        <div className="w-full flex gap-2 border border-gray-300 rounded-full overflow-hidden h-10">
          <input
            placeholder="Enviar mensagem..."
            disabled={status === "streaming"}
            className="border-none outline-none ring-none size-full px-4"
            autoComplete="off"
            {...register("userMessage")}
          />
          <button
            className="px-3 cursor-pointer hover:bg-gray-100 flex justify-center items-center text-gray-800"
            disabled={status === "streaming"}
          >
            <Send size={18} className="mr-1" />
          </button>
        </div>
      </form>
    </Card>
  );
}
