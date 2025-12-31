"use client";

import { Card } from "@/components/ui/card";
import { UIMessage, useChat } from "@ai-sdk/react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Copy, RefreshCcw, Send } from "lucide-react";

import { Markdown } from "@/components/commom/markdown";
import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DefaultChatTransport } from "ai";
import { Separator } from "@/components/ui/separator";
import { agentsService } from "@/services/agents";
import { chatService } from "@/services/chat";
import { mutate } from "swr";

const chatSchema = z.object({
  userMessage: z.string().nonempty(),
});

type Form = z.infer<typeof chatSchema>;
interface MessageWithReasoning extends UIMessage {
  reasoning?: string;
}
export function Chat({
  id,
  initialMessages,
  name,
}: {
  id?: string | undefined;
  initialMessages?: UIMessage[];
  name: string;
}) {
  const baseURL = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: `${baseURL}/api/chat/${id}`,
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

  return (
    <Card className="w-2xl border  p-2 shadow-none  gap-0 rounded-r-xl flex flex-col items-center justify-between ">
      <header className="w-full py-2 px-4 bg-gray-50 text-gray-800 font-medium mb-1 ">
        <h1 className="text-sm">{name}</h1>
      </header>
      <Separator />

      <section className=" h-full pt-4 px-7 overflow-auto w-full">
        <AnimatePresence>
          {messages.map((m) => {
            const message = m as MessageWithReasoning;
            return (
              <motion.div
                key={message.id}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  key={message.id}
                  className={
                    "w-full flex " +
                    (message.role === "user" ? "justify-end" : "justify-start ")
                  }
                >
                  <div
                    className={cn({
                      "py-2 px-3 bg-gray-200 rounded-b-xl rounded-l-xl ":
                        message.role === "user",
                      "h-full": message.role === "assistant",
                    })}
                  >
                    {message.parts.filter((p) => p.type === "reasoning")
                      .length > 0 && (
                      <details
                        className="mb-2 text-sm text-gray-500 italic"
                        key={`${message.id}-reasoning`}
                      >
                        <summary className="cursor-pointer hover:text-gray-700">
                          Ver processo de pensamento...
                        </summary>
                        {message.parts
                          .filter((p) => p.type === "reasoning")
                          .map((p, index) => (
                            <div
                              className="ml-3 not-first:mt-0.5"
                              key={`${message.id}-reasoning-${index}}`}
                            >
                              <Markdown>{p.text}</Markdown>
                            </div>
                          ))}
                      </details>
                    )}
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <Markdown key={`${message.id}-${i}-text`}>
                              {part.text}
                            </Markdown>
                          );
                      }
                    })}
                  </div>
                </div>
                <div className="mt-1 h-8 ">
                  {message.role === "assistant" && status === "ready" && (
                    <div className="flex flex-row gap-1 border-t">
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
                                //@ts-expect-error: type error, fix later
                                message.parts[message.parts.length - 1].text
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
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div key="end-anchor" ref={endRef} className="h-4 shrink-0" />
      </section>

      <form
        className="w-full p-2 flex gap-2"
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
