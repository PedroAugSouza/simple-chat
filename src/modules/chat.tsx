"use client";

import { Card } from "@/components/ui/card";
import { useChat } from "@ai-sdk/react";

import { ChevronDown } from "lucide-react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DefaultChatTransport } from "ai";
import { Separator } from "@/components/ui/separator";
import { agentsService } from "@/services/agents";
import { MessageAssistant } from "@/components/commom/message-assistant.chat";
import { MessageUser } from "@/components/commom/message-user.chat";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { MyUIMessage } from "@/types";

import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { format } from "date-fns";
import { deleteChat, updateChat } from "@/app/(app)/chat/actions";

export function Chat({
  id,
  initialMessages,
  name,
}: {
  id?: string | undefined;
  initialMessages?: MyUIMessage[];
  name: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef<HTMLButtonElement>(null);

  const { messages, sendMessage, status } = useChat<MyUIMessage>({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: `/ai/chat/${id}`,
    }),
    experimental_throttle: 100,
    onFinish: async ({ message }) => {
      const lastPart = message.parts[message.parts.length - 1];
      if (lastPart?.type !== "text") return;

      const title = await agentsService.generateTitle({
        message: lastPart.text,
      });

      await updateChat(id!, {
        name: title,
      });
    },
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
    <Card className="flex-1 border border-zinc-300 py-2 shadow-none gap-0 rounded-r-xl flex flex-col items-center justify-between bg-white">
      <header className="w-full  px-4 text-foreground font-medium mb-1 grid place-items-center">
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
              onClick={() => deleteChat(id!)}
            >
              Excluir
            </button>
          </PopoverContent>
        </Popover>
      </header>
      <Separator />

      <section className=" h-full pt-4 md:px-8 px-2 overflow-auto w-full flex justify-center items-start">
        <div className="w-full max-w-5xl">
          <AnimatePresence>
            {messages.map((m, index, messages) => {
              return m.role === "assistant" ? (
                <MessageAssistant
                  {...m}
                  isLastMessage={lastMessage.id === m.id}
                  status={status}
                  key={m.id}
                  messages={messages}
                />
              ) : (
                <MessageUser {...m} key={m.id} />
              );
            })}
            {status === "submitted" && (
              <div className="w-full max-w-5xl mt-4">
                <Shimmer className="text-sm" duration={1}>
                  Thinking...
                </Shimmer>
              </div>
            )}
          </AnimatePresence>

          <div key="end-anchor" ref={endRef} className="h-4 shrink-0" />
        </div>
      </section>

      <div className="w-full py-2 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <PromptInput
            onSubmit={(message) => {
              if (!message.text.trim()) return;
              sendMessage({
                text: message.text,
                metadata: {
                  createdAt: new Date(),
                },
              });
            }}
          >
            <PromptInputTextarea
              placeholder="Enviar mensagem..."
              disabled={status === "streaming"}
            />
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </Card>
  );
}
