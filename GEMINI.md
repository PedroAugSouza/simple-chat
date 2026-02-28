# Academic AI: Intelligent Study Platform (Gemini Context)

This project is a specialized Academic AI platform designed for students and researchers. It focuses on contextualized study based on personal collections, document indexing, and automated study tracking.

## Architecture: Server-Side First

We strictly follow a Server-Side First architecture to maximize performance and security.

*   Page Pattern (src/app/): Pages are Server Components. Their primary role is to coordinate high-level data fetching and layout.
*   Isolated Component Fetching: Data fetching must happen as close to the usage as possible. Individual Server Components (e.g., a Sidebar or a Stats Card) should fetch their own data using Prisma instead of relying on the page to pass it down.
*   Streaming and Suspense: Every component that performs data fetching must be wrapped in a React Suspense boundary with a dedicated fallback (Skeleton or Shimmer) to enable granular streaming.
*   Modules Pattern (src/modules/): The src/modules directory contains the "render" logic. These are typically Client Components ("use client") that handle UI state and interactivity. They receive data as props from Server Components.
*   Data Mutations: All data mutations (Create, Update, Delete) are performed exclusively via Server Actions ("use server"). Traditional API routes are reserved only for real-time AI streaming.

## Database and Persistence

*   Stack: Prisma ORM with PostgreSQL is the primary relational database.
*   Vector Search: Turso (SQLite) is used for storing document embeddings and performing semantic search for RAG.
*   Convention: Prisma handles all metadata and user-related data; Turso is the engine for document context retrieval.
*   Performance: Direct Prisma calls in Server Components are preferred over internal API fetches.

## UI/UX Design Principles (Academic Clean)

The platform follows a high-end, professional, and minimalist aesthetic.

*   Clean Interface: Priority on whitespace, balanced typography, and clear visual hierarchy.
*   No AI Over-Styling: Avoid typical AI tropes like heavy gradients, neon glows, or hyper-complex icons.
*   Iconography: Use Lucide React icons sparingly. Icons should be light and functional, never exaggerated.
*   Typography: Focus on high readability for long academic texts (Geist Sans/Mono).
*   Interactions: Use motion (Framer Motion) for subtle, meaningful transitions that guide the user, not for decorative effects.

## Development Conventions

*   Type Safety: Use strict TypeScript for all logic.
*   Validation: Use Zod for schema validation in Server Actions and tool inputs.
*   UI Components: Always use `pnpm dlx shadcn@latest add <component>` to install new UI components from the shadcn/ui library.
*   AI Engine: Powered by Vercel AI SDK. Use streamText for the grounded chat and generateObject for structured data like flashcards.
*   Citations: AI responses must include citations linked to the specific document chunks stored in Turso.

## Key Files and Directories

*   src/app/: Server-side routing and data fetching components.
*   src/modules/: Interactive UI modules (Client Components).
*   src/app/ai/chat/: Grounded chat logic implementation.
*   src/lib/prisma.ts: Prisma client singleton.
*   prisma/schema.prisma: Source of truth for the relational database.
