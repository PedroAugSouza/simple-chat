import { gaClient } from "@/ai/clients/ga.client";
import { prisma } from "@/lib/prisma";
import { formatGaReport } from "@/utils/format-ga-response";
import { getSessionServer } from "@/utils/get-session.server";
import { tool } from "ai";
import z from "zod";

export const outputSchema = z.object({
  rows: z
    .array(
      z.object({
        metricValues: z
          .array(z.object({ value: z.string().optional() }))
          .optional(),
        dimensionValues: z
          .array(z.object({ value: z.string().optional() }))
          .optional(),
      }),
    )
    .optional(),
});

export const ga = tool({
  description:
    "esta tool, serve para fazer uma requisição ao GA4 caso o usuário pedir.",
  inputSchema: z.object({
    dateRange: z
      .object({
        startDate: z.string().describe("data inicial para requisição"),
        endDate: z.string().describe("data final para requisição"),
      })
      .describe(
        `data range que o usuário quer acessar da requisição do GA4, formato { startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD"}, se o usuário não pedir período, coloque "yesterday"`,
      ),
    dimensions: z.array(z.string()).describe("dimensions que o usuário quer"),
    metrics: z.array(z.string()).describe("metrics que o usuário quer"),
  }),
  outputSchema,
  execute: async ({ dateRange, dimensions, metrics }) => {
    const session = await getSessionServer();

    const integration = await prisma.integration.findFirst({
      where: {
        active: true,
        userId: session.id,
        provider: "ga",
      },
    });

    const credentials = JSON.parse(integration?.credentials || "{}");

    const request = await gaClient({
      refresh_token: credentials.refresh_token,
      property_id: "319239703",
      dateRange,
      dimensions,
      metrics,
    });

    const result = formatGaReport(request.data ?? { rows: [] });

    return result as any;
  },
});
