import { getUser } from "@/ai/adapters/github/get-user";
import { tool } from "ai";

import z from "zod";

export const routesSchema = z.object({
  get_repo: z
    .object({
      path: "/repos/{username}/{repo}",
    })
    .describe(
      "ENDPOINT onde retornamos apenas um repositorio, onde {repo} é o repositório descrito pelo usuário e {username} que vem do input."
    ),
  list_repos: z
    .object({
      path: "/users/{username}/repos",
    })
    .describe(
      "ENDPOINT onde retornamos apenas os repositórios do usuário, onde {username} é o nome do usuário que está salvo na integração do github."
    ),
});

export const resolvePath = tool({
  description:
    `Esta tool serve para informar qual a ENDPOINT que vamos retornar para fazer alguma requisição no github`.trim(),
  inputSchema: z.object({
    access_token: z
      .string()
      .describe(
        "este parâmetro é o paramêtro de autenticação do github, o access_token."
      ),
    repo: z
      .string()
      .optional()
      .describe(
        "se o usuário quiser acessar algum repositório específico, esse é o nome do repositorio que o usuário quer acessar"
      ),
  }),
  outputSchema: routesSchema,
  execute: async ({ repo, access_token }) => {
    const user = await getUser(access_token);
    const path = repo
      ? `/repos/${user.name}/${repo}`
      : `/users/${user.name}/repos`;

    return {
      get_repo: {
        path,
      },
      list_repos: {
        path,
      },
    };
  },
});
