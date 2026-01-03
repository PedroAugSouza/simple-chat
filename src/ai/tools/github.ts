import { tool } from "ai";
import z from "zod";
import { httpRequest } from "../adapters/github/http";
import { getUser } from "../adapters/github/get-user";

// --- Schema de Proprietário ---

// Schema para o objeto "Owner" (proprietário)
const OwnerSchema = z.object({
  login: z
    .string()
    .describe(
      "O nome de usuário único (handle) do proprietário ou da organização no GitHub."
    ),
  id: z
    .number()
    .int()
    .describe(
      "Identificador numérico único e imutável do usuário no banco de dados do GitHub."
    ),
  node_id: z
    .string()
    .describe(
      "Identificador global único (Global Node ID) usado para referenciar este objeto na API GraphQL do GitHub."
    ),
  avatar_url: z
    .string()
    .url()
    .describe("URL pública para a imagem de perfil (avatar) do usuário."),
  gravatar_id: z
    .string()
    .describe(
      "ID do Gravatar do usuário. Muitas vezes retorna uma string vazia se o usuário não usar o Gravatar diretamente."
    ),
  url: z
    .string()
    .url()
    .describe("URL da API REST para obter os detalhes deste usuário."),
  html_url: z
    .string()
    .url()
    .describe(
      "URL para visualizar o perfil do usuário no navegador (interface web do GitHub)."
    ),
  followers_url: z
    .string()
    .url()
    .describe("URL da API para listar os seguidores deste usuário."),
  following_url: z
    .string()
    .describe(
      "Modelo de URL (URI Template) para verificar quem o usuário segue. Contém o parâmetro opcional {/other_user}."
    ),
  gists_url: z
    .string()
    .describe(
      "Modelo de URL (URI Template) para listar os Gists do usuário. Contém o parâmetro opcional {/gist_id}."
    ),
  starred_url: z
    .string()
    .describe(
      "Modelo de URL (URI Template) para listar repositórios favoritados pelo usuário. Contém parâmetros {/owner}{/repo}."
    ),
  subscriptions_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar os repositórios que o usuário está observando (watching)."
    ),
  organizations_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar as organizações às quais o usuário pertence."
    ),
  repos_url: z
    .string()
    .url()
    .describe("URL da API para listar os repositórios públicos deste usuário."),
  events_url: z
    .string()
    .describe(
      "Modelo de URL (URI Template) para listar eventos públicos gerados pelo usuário. Contém {/privacy}."
    ),
  received_events_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar eventos que o usuário recebeu (de repositórios que segue, etc.)."
    ),
  type: z
    .string()
    .describe(
      "O tipo de conta do proprietário. Geralmente 'User' ou 'Organization'."
    ),
  site_admin: z
    .boolean()
    .describe(
      "Booleano indicando se o usuário é um administrador do site GitHub (staff)."
    ),
});

// --- Schema de Permissões ---
const PermissionsSchema = z.object({
  admin: z
    .boolean()
    .describe(
      "Indica se o usuário autenticado tem acesso administrativo ao repositório."
    ),
  push: z
    .boolean()
    .describe(
      "Indica se o usuário autenticado tem permissão para fazer push (escrever) no repositório."
    ),
  pull: z
    .boolean()
    .describe(
      "Indica se o usuário autenticado tem permissão para fazer pull (ler) do repositório."
    ),
});

// --- Schema de Segurança ---
const SecurityStatusSchema = z.object({
  status: z
    .string()
    .describe(
      "O estado atual da funcionalidade de segurança (ex: 'enabled', 'disabled')."
    ),
});

const SecurityAndAnalysisSchema = z
  .object({
    advanced_security: SecurityStatusSchema.optional().describe(
      "Configuração do GitHub Advanced Security (disponível para Enterprise)."
    ),
    secret_scanning: SecurityStatusSchema.optional().describe(
      "Configuração do escaneamento de segredos (detecta chaves de API commitadas)."
    ),
    secret_scanning_push_protection: SecurityStatusSchema.optional().describe(
      "Configuração da proteção de push para segredos (bloqueia o push se segredos forem detectados)."
    ),
    secret_scanning_non_provider_patterns:
      SecurityStatusSchema.optional().describe(
        "Configuração para padrões de segredos não providos por parceiros."
      ),
  })
  .optional()
  .describe("Configurações de segurança e análise de código do repositório.");

// --- Schema Principal do Repositório ---
const RepositorySchema = z.object({
  id: z
    .number()
    .int()
    .describe(
      "Identificador numérico único do repositório no banco de dados do GitHub."
    ),
  node_id: z
    .string()
    .describe(
      "Identificador global único (Global Node ID) para uso na API GraphQL."
    ),
  name: z
    .string()
    .describe(
      "O nome curto do repositório (slug), sem o nome do proprietário (ex: 'Hello-World')."
    ),
  full_name: z
    .string()
    .describe(
      "O nome completo do repositório, incluindo o proprietário (ex: 'octocat/Hello-World'). Único no GitHub."
    ),
  owner: OwnerSchema.describe(
    "Objeto contendo informações detalhadas sobre o proprietário do repositório."
  ),
  private: z
    .boolean()
    .describe("Indica se o repositório é privado (true) ou público (false)."),
  html_url: z
    .string()
    .url()
    .describe(
      "URL para acessar a página principal do repositório no navegador."
    ),
  description: z
    .string()
    .nullable()
    .describe(
      "A descrição curta ou slogan do repositório fornecida pelo usuário. Pode ser nula."
    ),
  fork: z
    .boolean()
    .describe(
      "Indica se este repositório é uma bifurcação (fork) de outro repositório."
    ),
  url: z
    .string()
    .url()
    .describe("URL base da API REST para manipular este repositório."),

  // URLs de Template (RFC 6570)
  archive_url: z
    .string()
    .describe(
      "Modelo de URL (URI Template) para baixar o código fonte como arquivo (zip, tar.gz). Ex: .../{archive_format}{/ref}."
    ),
  assignees_url: z
    .string()
    .describe(
      "Modelo de URL para listar ou gerenciar responsáveis por issues. Contém {/user}."
    ),
  blobs_url: z
    .string()
    .describe(
      "Modelo de URL para acessar blobs (arquivos) específicos via API. Contém {/sha}."
    ),
  branches_url: z
    .string()
    .describe(
      "Modelo de URL para acessar branches específicas via API. Contém {/branch}."
    ),
  collaborators_url: z
    .string()
    .describe(
      "Modelo de URL para listar colaboradores do repositório. Contém {/collaborator}."
    ),
  comments_url: z
    .string()
    .describe(
      "Modelo de URL para acessar comentários de commit ou gerais. Contém {/number}."
    ),
  commits_url: z
    .string()
    .describe("Modelo de URL para acessar commits específicos. Contém {/sha}."),
  compare_url: z
    .string()
    .describe(
      "Modelo de URL para comparar dois commits ou branches. Formato: .../{base}...{head}."
    ),
  contents_url: z
    .string()
    .describe(
      "Modelo de URL para acessar o conteúdo de arquivos ou diretórios. Contém {+path}."
    ),
  contributors_url: z
    .string()
    .url()
    .describe("URL da API para listar os contribuidores do repositório."),
  deployments_url: z
    .string()
    .url()
    .describe(
      "URL da API para gerenciar deployments associados ao repositório."
    ),
  downloads_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar downloads (recurso legado do GitHub, raramente usado hoje em dia)."
    ),
  events_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar eventos (atividades) ocorridos neste repositório."
    ),
  forks_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar as bifurcações (forks) deste repositório."
    ),
  git_commits_url: z
    .string()
    .describe(
      "Modelo de URL para acessar objetos de commit do Git (nível baixo). Contém {/sha}."
    ),
  git_refs_url: z
    .string()
    .describe(
      "Modelo de URL para acessar referências do Git (tags, heads). Contém {/sha}."
    ),
  git_tags_url: z
    .string()
    .describe(
      "Modelo de URL para acessar objetos de tag do Git. Contém {/sha}."
    ),
  git_url: z
    .string()
    .describe(
      "URL do protocolo Git (somente leitura) para clonar o repositório (git://...)."
    ),
  issue_comment_url: z
    .string()
    .describe(
      "Modelo de URL para comentários em issues e pull requests. Contém {/number}."
    ),
  issue_events_url: z
    .string()
    .describe(
      "Modelo de URL para eventos específicos de issues. Contém {/number}."
    ),
  issues_url: z
    .string()
    .describe("Modelo de URL para acessar issues. Contém {/number}."),
  keys_url: z
    .string()
    .describe(
      "Modelo de URL para chaves de deploy (deploy keys). Contém {/key_id}."
    ),
  labels_url: z
    .string()
    .describe(
      "Modelo de URL para labels (etiquetas) do repositório. Contém {/name}."
    ),
  languages_url: z
    .string()
    .url()
    .describe(
      "URL da API que retorna um objeto com a contagem de bytes por linguagem de programação usada."
    ),
  merges_url: z
    .string()
    .url()
    .describe("URL da API para realizar merges (fusão) de branches."),
  milestones_url: z
    .string()
    .describe(
      "Modelo de URL para milestones (marcos) do projeto. Contém {/number}."
    ),
  notifications_url: z
    .string()
    .describe(
      "Modelo de URL para notificações do repositório. Suporta parâmetros {?since,all,participating}."
    ),
  pulls_url: z
    .string()
    .describe("Modelo de URL para Pull Requests. Contém {/number}."),
  releases_url: z
    .string()
    .describe(
      "Modelo de URL para releases (lançamentos) do projeto. Contém {/id}."
    ),
  ssh_url: z
    .string()
    .describe(
      "URL para clonar o repositório via protocolo SSH (requer chave SSH configurada)."
    ),
  stargazers_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar usuários que deram estrela (star) no repositório."
    ),
  statuses_url: z
    .string()
    .describe(
      "Modelo de URL para status de commit (CI/CD success/failure). Contém {/sha}."
    ),
  subscribers_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar os inscritos (watchers) que recebem notificações."
    ),
  subscription_url: z
    .string()
    .url()
    .describe(
      "URL da API para gerenciar a inscrição do usuário atual neste repositório."
    ),
  tags_url: z
    .string()
    .url()
    .describe("URL da API para listar as tags do repositório."),
  teams_url: z
    .string()
    .url()
    .describe(
      "URL da API para listar as equipes com acesso a este repositório (apenas organizações)."
    ),
  trees_url: z
    .string()
    .describe(
      "Modelo de URL para acessar árvores de arquivos (git trees). Contém {/sha}."
    ),
  clone_url: z
    .string()
    .url()
    .describe("URL HTTPS recomendada para clonar o repositório."),
  mirror_url: z
    .string()
    .nullable()
    .describe(
      "URL de um espelho (mirror) do repositório, se existir. Geralmente nulo."
    ),
  hooks_url: z
    .string()
    .url()
    .describe("URL da API para gerenciar Webhooks do repositório."),
  svn_url: z
    .string()
    .url()
    .describe(
      "URL para acessar o repositório usando um cliente Subversion (SVN)."
    ),
  homepage: z
    .string()
    .nullable()
    .describe(
      "URL do site oficial ou página inicial do projeto configurada na seção 'About'."
    ),

  // Metadados e Estatísticas
  language: z
    .string()
    .nullable()
    .describe(
      "A linguagem de programação principal detectada no repositório (ex: 'TypeScript'). Pode ser nula."
    ),
  forks_count: z
    .number()
    .int()
    .describe("Número total de bifurcações (forks) deste repositório."),
  stargazers_count: z
    .number()
    .int()
    .describe("Número total de usuários que deram estrela neste repositório."),
  watchers_count: z
    .number()
    .int()
    .describe(
      "Número de usuários observando o repositório. Na API antiga, era igual a stargazers; hoje pode diferir dependendo do endpoint."
    ),
  size: z
    .number()
    .int()
    .describe(
      "Tamanho do repositório em kilobytes (KB). Nota: este valor é atualizado periodicamente, não em tempo real."
    ),
  default_branch: z
    .string()
    .describe(
      "O nome da branch padrão do repositório (ex: 'main' ou 'master')."
    ),
  open_issues_count: z
    .number()
    .int()
    .describe(
      "Número de issues abertas E pull requests abertos (a API do GitHub conta PRs como issues neste campo)."
    ),
  is_template: z
    .boolean()
    .describe(
      "Indica se este repositório está configurado como um template para gerar novos repositórios."
    ),
  topics: z
    .array(z.string())
    .describe(
      "Lista de tópicos (tags) associados ao repositório para categorização."
    ),

  // Flags de Funcionalidades
  has_issues: z
    .boolean()
    .describe(
      "Indica se a funcionalidade de Issues está habilitada nas configurações do repositório."
    ),
  has_projects: z
    .boolean()
    .describe("Indica se a aba de Projetos (Kanban) está habilitada."),
  has_wiki: z.boolean().describe("Indica se a Wiki está habilitada."),
  has_pages: z
    .boolean()
    .describe("Indica se o GitHub Pages está ativo neste repositório."),
  has_downloads: z
    .boolean()
    .describe(
      "Indica se a funcionalidade de Downloads (legada) está habilitada."
    ),
  has_discussions: z
    .boolean()
    .describe(
      "Indica se a funcionalidade de Discussões (fórum) está habilitada."
    ),

  // Estado
  archived: z
    .boolean()
    .describe("Indica se o repositório foi arquivado (somente leitura)."),
  disabled: z
    .boolean()
    .describe("Indica se o repositório foi desabilitado pelo GitHub."),
  visibility: z
    .string()
    .describe(
      "A visibilidade atual do repositório: 'public', 'private' ou 'internal' (para GitHub Enterprise)."
    ),

  // Datas
  pushed_at: z
    .string()
    .datetime()
    .describe(
      "Data e hora (ISO 8601) do último push (commit) em qualquer branch. Pode ser mais recente que updated_at."
    ),
  created_at: z
    .string()
    .datetime()
    .describe("Data e hora (ISO 8601) em que o repositório foi criado."),
  updated_at: z
    .string()
    .datetime()
    .describe(
      "Data e hora (ISO 8601) da última alteração nos metadados do repositório (ex: mudança de descrição, estrela recebida)."
    ),

  // Campos Opcionais / Condicionais
  permissions: PermissionsSchema.optional().describe(
    "Permissões do usuário autenticado em relação a este repositório. Presente apenas em algumas chamadas autenticadas."
  ),
  security_and_analysis: SecurityAndAnalysisSchema,
});

export const GitHubRepositoriesSchema = z
  .array(RepositorySchema)
  .describe("Lista de repositórios retornada pela API do GitHub.");

export type OutputSchema = z.infer<typeof RepositorySchema>;

export const github = tool({
  description:
    "esta ferramenta serve para retonar informações para o usuário sobre os repositórios que ele tem no github ou informações de um repositório específico.",
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
        "este parametro diz o nome do repositorio que o usuario quer acessar, se o usuario quiser acessar um repositorio espefico, é um campo opcional."
      ),
  }),
  outputSchema: GitHubRepositoriesSchema,
  execute: async ({ access_token, repo }) => {
    const user = await getUser(access_token);

    const path = repo
      ? `/repos/${user.login}/${repo}`
      : `/users/${user.login}/repos`;

    const response = await httpRequest({ path, token: access_token });

    return response;
  },
});
