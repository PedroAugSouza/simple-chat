import {
  streamText,
  UIMessage,
  convertToModelMessages,
  generateId,
  extractReasoningMiddleware,
  wrapLanguageModel,
  stepCountIs,
  smoothStream,
} from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createMistral, mistral } from "@ai-sdk/mistral";
import { prisma } from "@/lib/prisma";
import { ENV } from "@/config/env";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { weather } from "@/ai/tools/weather";
import { github } from "@/ai/tools/github";
import { integrationTool } from "@/ai/tools/integration";
import { MyUIMessage } from "@/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { messages }: { messages: MyUIMessage[] } = await req.json();

  const chatId = (await params).id;
  const storage = await cookies();

  const token = storage.get("token")?.value;

  const session = jwtDecode<{ id: string }>(token ?? "");

  const settings = await prisma.settings.findFirst({
    where: {
      userId: session.id,
    },
  });

  // const apiKey = settings?.apiKey
  //   ? settings?.apiKey === ""
  //     ? ENV.ANTHROPIC_API_KEY
  //     : settings?.apiKey
  //   : ENV.ANTHROPIC_API_KEY;

  // const anthropic = createAnthropic({ apiKey });

  // const mid = wrapLanguageModel({
  //   model: anthropic(settings?.model ?? "claude-3-7-sonnet-latest"),
  //   middleware: extractReasoningMiddleware({
  //     tagName: "think",
  //   }),
  // });

  const mid = wrapLanguageModel({
    model: mistral("magistral-small-2506"),
    middleware: extractReasoningMiddleware({
      tagName: "think",
    }),
  });

  const result = streamText({
    model: mid,
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
    maxOutputTokens: 2048,
    maxRetries: 2,
    tools: {
      weather,
      integrationTool,
      github,
    },
    experimental_transform: smoothStream({
      chunking: "line",
      delayInMs: 20,
    }),
    stopWhen: stepCountIs(10),
    system: `
      responda em português.

      se o usuário solicitar alguma integração, procure as credenciais antes de qualquer outra tool.

      - quando usar alguma tool ou efetuar alguma pesquisa, retorne o pensamento dentro de tag "<think></think>", por exemplo:

      - não retorne algum tipo de credencial em <think></think>
      
      <think>chamando a tool X</think>
      
      <think>Verificando essas informações para você.</think>
      
      - não responda coisas antes do resultado da busca que não seja pensamento.

      `.trim(),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendReasoning: true,
    messageMetadata: ({ part }) => {
      if (part.type === "start") {
        return {
          createdAt: new Date(),
        };
      }
    },
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
                metadata: JSON.stringify(message.metadata),
                id: message.id.trim().length === 0 ? generateId() : message.id,
              })),
            },
          },
        },
      });
    },
  });
}
