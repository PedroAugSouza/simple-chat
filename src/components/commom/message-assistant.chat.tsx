"use client";

import { UIMessage } from "ai";
import { motion } from "motion/react";
import { Markdown } from "./markdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";

export const MessageAssistant = (message: UIMessage & { status: string }) => {
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
    <div className="group transition-all">
      <div key={message.id} className="w-full flex justify-start  mt-10">
        <div className="h-full">
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
    </div>
  );
};
