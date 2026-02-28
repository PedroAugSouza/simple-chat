"use client";

import { createChat } from "@/app/(app)/chat/actions";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { useTransition } from "react";

export function ChatEmpty() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(() => createChat());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-500 p-8 bg-zinc-50">
      <div className="bg-accent/30 p-4 rounded-full mb-6">
        <img src="/icon.svg" alt="OrbMind" className="h-12 w-12" />
      </div>

      <h1 className="text-2xl font-medium text-zinc-900 mb-2 tracking-tight">
        OrbMind
      </h1>

      <p className="text-center max-w-md mb-8 leading-relaxed">
        Seu assistente de estudos inteligente. Selecione uma conversa na barra
        lateral ou comece uma nova sessão para estudar seus documentos.
      </p>

      <div className="w-full max-w-2xl">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            placeholder="Pergunte algo sobre seus documentos..."
            disabled={isPending}
          />
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled={isPending} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
