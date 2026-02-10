import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  smoothStream,
} from "ai";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { weather } from "@/ai/tools/weather";
import { MyUIMessage } from "@/types";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { SYSTEM_PROMPT } from "@/ai/prompts/chat";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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

  const openrouter = createOpenRouter({
    apiKey:
      "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",
  });

  const result = streamText({
    model: openrouter("z-ai/glm-4.5-air:free"),
    messages: await convertToModelMessages(messages),
    maxRetries: 10,
    tools: {
      weather,
    },
    experimental_transform: smoothStream({
      chunking: "word",
    }),
    stopWhen: stepCountIs(10),
    system: SYSTEM_PROMPT.trim(),

    onFinish: async ({ response }) => {
      const assistantMessage = response.messages[response.messages.length - 1];

      const userMessage = messages[messages.length - 1];

      await prisma.chat.update({
        where: { id: chatId },
        data: {
          messages: {
            createMany: {
              data: [
                {
                  text: JSON.stringify(userMessage.parts),
                  role: userMessage.role,
                  metadata: JSON.stringify(userMessage.metadata ?? {}),
                },
                {
                  text: JSON.stringify(assistantMessage.content),
                  role: assistantMessage.role,
                  metadata: JSON.stringify({ createdAt: new Date() }),
                },
              ],
            },
          },
        },
      });
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
