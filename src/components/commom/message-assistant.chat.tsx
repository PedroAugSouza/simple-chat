"use client";

import { motion } from "motion/react";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { SimplIcon } from "@/icons";
import { format } from "date-fns";
import { MyUIMessage } from "@/types";
import { Markdown } from "./markdown";

export const MessageAssistant = (
  message: MyUIMessage & { status: string; isLastMessage: boolean }
) => {
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

  const isThinking = message.isLastMessage && message.status === "streaming";

  return (
    <motion.div
      key={message.id}
      className="group transition-all mt-4"
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div key={message.id} className=" gap-2 flex justify-start">
        <div
          className={cn(
            " h-7.5   grid place-items-center after:rounded-sm relative",
            {
              "after:p-0.5 after:inset-0.2 after:absolute after:animate-ping after:size-8.5 after:bg-gray-400":
                isThinking,
            }
          )}
        >
          <SimplIcon width={30} height={30} className="rounded relative z-10" />
        </div>

        <div>
          <div className="items-center flex flex-row gap-1 text-xs font-mono">
            <span>Simpl</span>
            <span className="size-1 bg-black" />
            <span>
              {format(message.metadata?.createdAt ?? new Date(), "HH:mm")}
            </span>
          </div>
          <div className="h-full w-full max-w-5xl">
            {message.parts.filter((p) => p.type === "reasoning").length > 0 && (
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
      </div>
      <div className="mt-1 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
        {message.role === "assistant" && message.status === "ready" && (
          <div className="flex flex-row gap-1 ">
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
              <TooltipContent>{copied ? "Copiado!" : "Copiar"}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </motion.div>
  );
};
