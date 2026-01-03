import { tool } from "ai";
import z from "zod";
import { integrations } from "../adapters/integrations/get";

export const integrationTool = tool({
  description: `
 Caso o usuário solicite alguma ferramenta/app, essa tool serve para retornar as credenciais para assim poder acessar algo desta integração

 apps que o usuário pode pedir que nós temos integração:
  - github(repositórios)
 `.trim(),
  inputSchema: z.object({
    provider: z
      .string()
      .describe("integração/app/ferramenta que o usuário quer acessar"),
  }),
  inputExamples: [{ input: { provider: "github" } }],
  outputSchema: z.object({
    credentials: z.record(z.string(), z.string()),
  }),
  execute: async ({ provider }) => {
    const integration = await integrations(provider);

    return {
      credentials: integration.credentials,
    };
  },
});
