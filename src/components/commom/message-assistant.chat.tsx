"use client";

import { motion } from "motion/react";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { Brain, Copy } from "lucide-react";
import { useEffect, useState } from "react";
// owl icon from public/icon.svg
import { format } from "date-fns";
import { MyUIMessage } from "@/types";
import { Markdown } from "./markdown";
import { ChatStatus } from "ai";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Shimmer } from "../ai-elements/shimmer";

export const MessageAssistant = (
  message: MyUIMessage & {
    status: ChatStatus;
    isLastMessage: boolean;
    messages: MyUIMessage[];
  },
) => {
  const [copied, setCopied] = useState(false);

  const isStreaming = message.status === "streaming";

  const reasoningParts = message.parts.filter(
    (part) => part.type === "reasoning",
  );
  const reasoningText = reasoningParts.map((part) => part.text).join("\n\n");
  const hasReasoning = reasoningParts.length > 0;

  // Check if reasoning is still streaming (last part is reasoning on last message)
  const lastPart = message.parts.at(-1);
  const isReasoningStreaming =
    message.isLastMessage && isStreaming && lastPart?.type === "reasoning";

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
    <div key={message.id} className="group transition-all mt-4">
      <div key={message.id} className=" gap-2 flex justify-start">
        <img
          src="/icon.svg"
          alt="OrbMind"
          className="h-6 w-6 rounded relative z-10"
        />

        <div>
          <div className="items-center flex flex-row gap-1 text-xs font-mono">
            <span className="size-1 bg-black" />
            <span>
              {format(message.metadata?.createdAt ?? new Date(), "HH:mm")}
            </span>
          </div>
          <div className="h-full w-full max-w-5xl">
            {hasReasoning && (
              <Reasoning className="w-full" isStreaming={isReasoningStreaming}>
                <ReasoningTrigger />
                <ReasoningContent>{reasoningText}</ReasoningContent>
              </Reasoning>
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
                    copied && "bg-zinc-200",
                  )}
                  onClick={() =>
                    handleCopyContent(
                      //@ts-expect-error: type error, fix later
                      message.parts[message.parts.length - 1].text,
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
