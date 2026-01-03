import { anthropic } from "@ai-sdk/anthropic";
import { generateText, UIMessage } from "ai";
import { NextResponse } from "next/server";

// "agent" para gerar titulos
export const POST = async (req: Request) => {
  const { message }: { message: string } = await req.json();

  const result = await generateText({
    model: anthropic("claude-3-7-sonnet-latest"),
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
        message
      )}`.trim(),
  });

  return NextResponse.json({ text: result.text });
};
