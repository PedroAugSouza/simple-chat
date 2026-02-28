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
import { turso } from "@/lib/turso";
import { generateEmbedding } from "@/lib/embeddings";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { messages }: { messages: MyUIMessage[] } = await req.json();

  const chatId = (await params).id;
  const storage = await cookies();

  const token = storage.get("token")?.value;

  const session = jwtDecode<{ id: string }>(token ?? "");

  // 1. Get the last user message
  const lastUserMessage = messages[messages.length - 1];
  const lastUserText = lastUserMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");

  let context = "";

  // 2. RAG: Retrieve relevant chunks if there is text
  if (lastUserText) {
    try {
      const embedding = await generateEmbedding(lastUserText);

      // Vector search in Turso using cosine distance
      // Using Float32Array buffer for the embedding is the most robust way to pass binary vectors
      const vectorQuery = await turso.execute({
        sql: `
          SELECT content, documentId, vector_distance_cos(embedding, ?) as distance
          FROM document_chunks 
          WHERE userId = ?
          ORDER BY distance ASC 
          LIMIT 5
        `,
        args: [new Float32Array(embedding).buffer, session.id],
      });

      if (vectorQuery.rows.length > 0) {
        const chunks = vectorQuery.rows
          .map((row) => row.content)
          .join("\n\n---\n\n");
        context = `
START OF CONTEXT BLOCK
The following are excerpts from the user's document collection. Use them to answer the question if relevant.
If the answer is not in the context, you can use your own knowledge but mention that the documents don't cover it.

${chunks}
END OF CONTEXT BLOCK
        `;
      }
    } catch (error) {
      console.error("RAG Retrieval Error:", error);
      // Continue without context if retrieval fails
    }
  }

  const openrouter = createOpenRouter({
    apiKey:
      "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",
  });

  const result = streamText({
    model: openrouter("z-ai/glm-4.5-air:free"),
    messages: await convertToModelMessages(messages),
    maxRetries: 3, // Reduced from 10
    tools: {
      weather,
    },
    experimental_transform: smoothStream({
      chunking: "word",
    }),
    stopWhen: stepCountIs(10),
    system: `${SYSTEM_PROMPT.trim()}\n\n${context}`,

    onFinish: async ({ response }) => {
      const assistantMessage = response.messages[response.messages.length - 1];

      // Save messages to DB
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          messages: {
            createMany: {
              data: [
                {
                  text: JSON.stringify(lastUserMessage.parts),
                  role: lastUserMessage.role,
                  metadata: JSON.stringify(lastUserMessage.metadata ?? {}),
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
