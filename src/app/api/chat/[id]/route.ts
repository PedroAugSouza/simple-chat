import {
  streamText,
  UIMessage,
  convertToModelMessages,
  generateId,
  extractReasoningMiddleware,
  wrapLanguageModel,
  tool,
  stepCountIs,
} from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import z from "zod";
import { ENV } from "@/config/env";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

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

  console.log(settings);

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
      wheather: tool({
        description: "Serve para retornar a temperatura de um local",
        inputSchema: z.object({
          location: z.string().describe("local"),
        }),
        inputExamples: [
          { input: { location: "São Francisco" } },
          { input: { location: "Londres" } },
          { input: { location: "Barueri" } },
        ],
        execute: async ({ location }) => {
          const request = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=0d77e335f37cee4f874777d67247c9b3`
          );
          const data = await request.json();

          return {
            temperature: data.main.temp - 273.15,
            humidity: data.main.humidity,
            name: data.name,
          };
        },
      }),
    },
    stopWhen: stepCountIs(5),

    system: `
      responda em português.

      
      - quando usar alguma tool ou efetuar alguma pesquisa, retorne o pensamento dentro de tag "<think></think>", por exemplo:
      
      <think>chamando a tool X</think>
      
      <think>Verificando essas informações para você.</think>
      
      <think>Busquei em uma api externa informações sobre...</think>
      
      - não precisa retornar coisas antes da busca que não seja pensamento
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const chatId = (await params).id;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: chat.id,
        name: chat.name,
        messages: [
          ...chat.messages.map((message) => ({
            parts: JSON.parse(message.text),
            ...message,
          })),
        ],
      },
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}

interface PatchBody {
  name?: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const body = (await req.json()) as PatchBody;

    await prisma.chat.update({
      where: { id },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    await prisma.chat.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}
