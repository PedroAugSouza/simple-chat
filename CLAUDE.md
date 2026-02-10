# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SimplAi is a Next.js 16 AI chat application with multi-provider LLM support and third-party integrations (GitHub, Google Analytics). The app is written in Portuguese (Brazilian).

## Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Generate Prisma client and build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database

```bash
docker compose up -d                    # Start PostgreSQL container
npx prisma migrate dev                  # Run migrations
npx prisma generate                     # Regenerate Prisma client
```

Database connection uses `POSTGRES_PRISMA_URL` environment variable.

## Architecture

### AI Chat Flow

1. **Chat UI** (`src/modules/chat.tsx`) uses `@ai-sdk/react` useChat hook with `DefaultChatTransport`
2. **Chat API** (`src/app/ai/chat/[id]/route.ts`) handles streaming via Vercel AI SDK's `streamText`
3. **Tools** are defined in `src/ai/tools/` and registered in the chat route:
   - `integrationTool` - Retrieves OAuth credentials for external services
   - `github` - GitHub API operations (repos, files)
   - `ga` - Google Analytics 4 data queries
   - `weather` - Weather data

### Integration Pattern

Third-party integrations use OAuth flow:
- OAuth routes: `src/app/api/oauth/start/[provider]/` and `src/app/api/oauth/callback/[provider]/`
- Credentials stored encrypted in `Integration` table
- `integrationTool` retrieves credentials at runtime for other tools to use
- API clients: `src/ai/clients/` (e.g., `github.client.ts`, `ga.client.ts`)

### Route Groups

- `(app)` - Authenticated app routes (chat, settings)
- `(auth)` - Public auth routes (login, register)

### Key Directories

- `src/ai/` - AI tools, adapters, and API clients
- `src/services/` - Client-side service layer for API calls
- `src/modules/` - Page-level components (Chat, Settings, Login)
- `src/components/commom/` - Shared components (note: typo "commom" is intentional in codebase)
- `src/components/ui/` - Radix-based UI primitives

### Authentication

JWT-based auth with tokens stored in cookies. Session helpers:
- `getSession()` - Client-side session
- `getSessionServer()` - Server-side session

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: Vercel AI SDK with OpenAI, Anthropic, Mistral, Google providers
- **Database**: PostgreSQL via Prisma with `@prisma/adapter-pg`
- **Styling**: Tailwind CSS 4
- **UI**: Radix UI primitives, shadcn/ui pattern
- **Forms**: react-hook-form + zod
- **Data Fetching**: SWR
