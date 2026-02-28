# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Academic AI study platform built with Next.js 16 (App Router), React 19, TypeScript 5, and Tailwind CSS 4. Designed for students/researchers to upload documents, index them with embeddings, and chat with an AI grounded in their personal collection (RAG). The system prompt and UI are in **Portuguese (pt-BR)**.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Generate Prisma client + build Next.js
pnpm lint             # ESLint (v9, includes Vercel AI security plugin)
pnpm dlx prisma migrate dev   # Run database migrations
pnpm dlx prisma generate      # Regenerate Prisma client
pnpm dlx shadcn@latest add <component>  # Add shadcn/ui components
pnpm dlx ai-elements@latest add <component>  # Add AI Elements components
pnpm db:init-turso    # Initialize Turso vector DB tables
```

## Architecture: Server-Side First

- **Pages** (`src/app/`) are Server Components — fetch data directly via Prisma, no internal API calls.
- **Modules** (`src/modules/`) are Client Components (`"use client"`) — handle UI state and interactivity, receive data as props from Server Components.
- **Data mutations** use Server Actions (`"use server"`) exclusively. Traditional API routes are reserved only for AI streaming (`src/app/ai/`).
- **Server Action patterns** — see "Server Actions" section below for detailed conventions.
- **Isolated component fetching**: each Server Component fetches its own data (e.g., Sidebar fetches chats directly) rather than receiving props from parent pages.
- Wrap data-fetching components in `<Suspense>` with skeleton/shimmer fallbacks.

## Database

- **PostgreSQL + Prisma ORM**: relational data (users, chats, messages, documents, settings, integrations). Schema at `prisma/schema.prisma`.
- **Turso (LibSQL/SQLite)**: vector storage for document embeddings and cosine similarity search. Client at `src/lib/turso.ts`.
- Prisma client singleton at `src/lib/prisma.ts` (uses `@prisma/adapter-pg`).
- Embeddings: OpenAI `text-embedding-3-small` (1536 dimensions) via `src/lib/embeddings.ts`. Bulk embedding uses `embedMany` in batches of 20; single query embedding uses `embed`.

## AI / Chat Flow

- AI routes live under `src/app/ai/` — uses Vercel AI SDK (`streamText`, `generateObject`).
- Chat model: OpenRouter proxy (`z-ai/glm-4.5-air:free`).
- RAG pipeline: user message → generate embedding → vector search in Turso (top 5 chunks) → inject context into system prompt → stream response.
- Messages saved to PostgreSQL in `onFinish` callback after streaming completes.
- Title auto-generation agent at `src/app/ai/agents/generate-title/`.
- System prompt defined in `src/ai/prompts/chat.ts` — includes guardrails: anti-alucinação, anti-jailbreak, escopo acadêmico, anti-plágio.
- AI tools (GitHub, Google Analytics, weather) in `src/ai/tools/`.

## Auth

- JWT-based: access token (24h) + session token (30d) stored in HTTP-only cookies.
- `getSession()` (client-side, `src/utils/get-session.ts`) and `getSessionServer()` (server-side, `src/utils/get-session.server.ts`).
- Password hashing with bcryptjs. OAuth partially implemented for GitHub and Google.

## Server Actions

### Loading & Navigation
- Use `useTransition` for loading states — never manual `useState(isLoading)`.
- When the action needs redirecionar o usuário, use `redirect()` from `next/navigation` **inside** the server action — never client-side `router.push()` after the action.

```tsx
// Client: useTransition for loading
const [isPending, startTransition] = useTransition();
const handleClick = () => startTransition(() => myAction(data));

// Server: redirect inside the action
"use server";
import { redirect } from "next/navigation";
export async function createChat(userId: string) {
  const chat = await prisma.chat.create({ ... });
  redirect(`/chat/${chat.id}`);
}
```

### Return pattern
- `{ success: boolean, error?: string, data?: T }` — when the action returns data to the client (no redirect).

### Validation
- Zod v4 schemas for all Server Action inputs (use `z.cuid()` for Prisma IDs, not `z.uuid()`).
- Validate at the top of every action before any DB call.

### Forms
- **2+ fields**: use `react-hook-form` + `zod` resolver. Define the schema, infer the type, validate client-side before calling the action.
- **Single action buttons**: just `useTransition` + direct action call (no form library needed).
- Always sanitize/validate on the server side too (Zod schema inside the action) — client validation is for UX, server validation is for security.

## UI Components

- **shadcn/ui**: New York style, CSS variables enabled, components in `src/components/ui/`. Add via `pnpm dlx shadcn@latest add <component>`.
- **AI Elements (Vercel)**: pre-built AI components (message threads, code blocks, reasoning displays, streaming states) built on shadcn/ui. Add via `pnpm dlx ai-elements@latest add <component>`. Use for chat UI and any AI-powered interface. Components in `src/components/ai-elements/`.
- **UI style**: "Academic Clean" — minimalist, whitespace-focused, no AI-style gradients/glows. Lucide React icons used sparingly.
- **Fonts**: Source Serif 4 + Geist Mono.
- **Animations**: Motion library for subtle transitions only.
- **Toast notifications**: Sonner (top-center).

## Document Processing

- Upload endpoint: `src/app/(app)/collection/actions.ts`
- Supported: PDF (`pdf2json`), DOCX (`mammoth`), MD, TXT. Max 10MB.
- Pipeline: extract text → chunk (1000 chars, 200 overlap) → `embedMany` in batches of 20 → `turso.batch()` insert → save metadata to PostgreSQL.
- Files stored locally at `./uploads/[userId]/` with UUID prefix to avoid name conflicts.
- `next.config.ts` sets `experimental.serverActions.bodySizeLimit: "10mb"` to match the 10MB upload limit.
- Turso table initialization is handled by the dedicated `pnpm db:init-turso` script — not called during upload.
