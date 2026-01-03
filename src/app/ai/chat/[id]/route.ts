import {
  streamText,
  UIMessage,
  convertToModelMessages,
  generateId,
  extractReasoningMiddleware,
  wrapLanguageModel,
  stepCountIs,
} from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { prisma } from "@/lib/prisma";
import { ENV } from "@/config/env";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { weather } from "@/ai/tools/weather";
import { github } from "@/ai/tools/github";
import { integrationTool } from "@/ai/tools/integration";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const chatId = (await params).id;
  const storage = await cookies();

  const token = storage.get("token")?.value;

  const session = jwtDecode<{ id: string }>(token ?? "");

  const settings = await prisma.settings.findFirst({
    where: {
      userId: session.id,
    },
  });

  const apiKey = settings?.apiKey
    ? settings?.apiKey === ""
      ? ENV.ANTHROPIC_API_KEY
      : settings?.apiKey
    : ENV.ANTHROPIC_API_KEY;

  const anthropic = createAnthropic({ apiKey });

  const mid = wrapLanguageModel({
    model: anthropic(settings?.model ?? "claude-3-7-sonnet-latest"),
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
  });

  const result = streamText({
    model: mid,
    messages: await convertToModelMessages(messages),
    temperature: 0.3,
    maxOutputTokens: 512,
    maxRetries: 2,
    tools: {
      weather,
      integrationTool,
      github,
    },
    stopWhen: stepCountIs(10),
    onStepFinish: async (step) => {
      console.log(step);
    },

    system: `
      responda em português.

      se o usuário solicitar alguma integração, procure as credenciais antes de qualquer outra tool.

      - quando usar alguma tool ou efetuar alguma pesquisa, retorne o pensamento dentro de tag "<think></think>", por exemplo:
      
      <think>chamando a tool X</think>
      
      <think>Verificando essas informações para você.</think>
      
      <think>Busquei em uma api externa informações sobre...</think>
      
      - não responda coisas antes do resultado da busca que não seja pensamento.

      `.trim(),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages }) => {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          messages: {
            createMany: {
              skipDuplicates: true,
              data: messages.map((message) => ({
                role: message.role,
                text: JSON.stringify(message.parts),
                id: message.id.trim().length === 0 ? generateId() : message.id,
              })),
            },
          },
        },
      });
    },
  });
}
