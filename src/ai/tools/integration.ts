import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/utils/get-session.server";
import { tool } from "ai";
import z from "zod";

export const integrationTool = tool({
  description: `
 Essa tool vai fornecer as credenciais salvas de integrações/ferramentas (access_token, refresh_token, etc) para que outras tools possam usar essas credenciais para fazer requisições.

 apps que o usuário pode pedir que nós temos integração:
  - github(repositórios)
  - ga(sessões/investimento)
 `.trim(),
  inputSchema: z.object({
    provider: z
      .string()
      .describe("integração/app/ferramenta que o usuário quer acessar"),
  }),
  inputExamples: [
    { input: { provider: "github" } },
    { input: { provider: "ga" } },
  ],
  outputSchema: z.object({
    credentials: z.record(z.string(), z.string()),
  }),
  execute: async ({ provider }) => {
    const user = await getSessionServer();

    const integration = await prisma.integration.findFirst({
      where: {
        userId: user.id,
        provider,
      },
    });

    return {
      credentials: JSON.parse(integration?.credentials ?? ""),
    };
  },
});
