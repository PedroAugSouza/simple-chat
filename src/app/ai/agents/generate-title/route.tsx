import { anthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, UIMessage } from "ai";
import { NextResponse } from "next/server";

// "agent" para gerar titulos
export const POST = async (req: Request) => {
  const { message }: { message: string } = await req.json();

  const openrouter = createOpenRouter({
    apiKey:
      "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",
  });

  const result = await generateText({
    model: openrouter("z-ai/glm-4.5-air:free"),
    system: `
    Você é um escritor profissional.
    Você escreve de forma clara, simples, o objetiva e consistente;
    Você apenas intitula conversas.
    O título pode também ser um resumo da mensagem caso falte informação.
    Sem Markdown, apenas texto.
    retorne de forma objetiva, sem "Título:...", retorne apenas o conteúdo, como por exemplo "Resumo de Análise Técnica de Sistemas de Informação"
   `.trim(),
    prompt:
      `Gere um título para esta conversa bseada nesta resposta(se faltar informação, gere um resumo): ${JSON.stringify(
        message,
      )}`.trim(),
  });

  return NextResponse.json({ text: result.text });
};
