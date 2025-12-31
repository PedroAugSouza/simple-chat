"use client";

import { Card } from "@/components/ui/card";
import { UIMessage, useChat } from "@ai-sdk/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Copy, RefreshCcw, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Markdown } from "@/components/commom/markdown";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const chatSchema = z.object({
  userMessage: z.string().nonempty(),
});

type Form = z.infer<typeof chatSchema>;

export default function Chat() {
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, regenerate } = useChat();

  const { register, handleSubmit, reset } = useForm<Form>({
    resolver: zodResolver(chatSchema),
  });

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const [copied, setCopied] = useState(false);

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timeout);
  }, [copied]);

  const blockMessages = useMemo(() => {
    const blocks: UIMessage[][] = [];
    let i = 0;
    while (i < messages.length) {
      const current = messages[i];
      if (current?.role === "user") {
        const next = messages[i + 1];
        if (next && next.role === "assistant") {
          blocks.push([current, next]);
          i += 2;
          continue;
        }
        blocks.push([current]);
        i += 1;
        continue;
      }
      if (current) {
        blocks.push([current]);
      }
      i += 1;
    }
    return blocks;
  }, [messages]);

  return (
    <main className="grid place-items-center h-screen">
      <Card className="w-2xl h-fit border border-gray-300 p-0 shadow-none overflow-hidden gap-0">
        <header className="w-full p-4 bg-gray-50 border-b border-gray-300 text-gray-800">
          <h1>Chat</h1>
        </header>
        <ScrollArea className="h-172">
          <section className=" py-4 px-7">
            <AnimatePresence>
              {blockMessages.map((block, blockIndex, blocks) => {
                const isLastBlock = blockIndex === blocks.length - 1;
                return (
                  <motion.div
                    key={
                      block[0]?.id
                        ? `${block[0].id}-${blockIndex}`
                        : `block-${blockIndex}`
                    }
                    layout="position"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "mx-auto w-full max-w-4xl py-6 last:border-0 dark:border-white/5 gap-4 flex flex-col",
                      isLastBlock ? "min-h-full flex-1" : "flex-none"
                    )}
                  >
                    {block.map((message) => (
                      <>
                        <div
                          key={message.id}
                          className={
                            "w-full flex " +
                            (message.role === "user"
                              ? "justify-end"
                              : "justify-start h-full")
                          }
                        >
                          <div
                            className={cn({
                              "py-2 px-3 bg-gray-200 rounded-b-xl rounded-l-xl ":
                                message.role === "user",
                              "h-full": message.role === "assistant",
                            })}
                          >
                            {message.parts.map((part, i) => {
                              switch (part.type) {
                                case "text":
                                  return (
                                    <Markdown key={`${message.id}-${i}`}>
                                      {part.text}
                                    </Markdown>
                                  );
                              }
                            })}
                          </div>
                        </div>
                        {message.role === "assistant" && status === "ready" && (
                          <div className="flex flex-row gap-2 border-t p-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    "cursor-pointer rounded-full p-1 transition-colors",
                                    copied && "bg-zinc-200"
                                  )}
                                  onClick={() =>
                                    handleCopyContent(
                                      message.parts
                                        .map(
                                          (part) =>
                                            part.type === "text" && part.text
                                        )
                                        .join("\n")
                                    )
                                  }
                                  aria-label="Copiar mensagem"
                                >
                                  <Copy size={14} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {copied ? "Copiado!" : "Copiar"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="cursor-pointer rounded-full p-1 transition-colors"
                                  onClick={() =>
                                    regenerate({ messageId: message.id })
                                  }
                                >
                                  <RefreshCcw size={14} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Refazer</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div key="end-anchor" ref={endRef} className="h-4 shrink-0" />
          </section>
        </ScrollArea>

        <form
          className="w-full p-4 flex gap-2"
          onSubmit={handleSubmit((data) => {
            sendMessage({
              text: data.userMessage,
            });
            reset();
          })}
        >
          <div className="w-full flex gap-2 border border-gray-300 rounded-full overflow-hidden h-10">
            <input
              placeholder="Enviar mensagem..."
              disabled={status === "streaming"}
              className="border-none outline-none ring-none size-full px-4"
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
    </main>
  );
}
