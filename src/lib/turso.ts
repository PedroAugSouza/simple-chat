import "dotenv/config";
import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórios");
}

export const turso = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export async function initializeTurso() {
  // 1. Create the main document chunks table
  // We use F32_BLOB(1536) for OpenAI text-embedding-3-small compatibility
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      documentId TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding F32_BLOB(1536),
      metadata TEXT
    )
  `);

  // 2. Create a standard index for fast user/document lookups (relational)
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_user_doc ON document_chunks(userId, documentId)
  `);

  // 3. Create a vector index for fast similarity search
  try {
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_chunks_embedding 
      ON document_chunks(libsql_vector_idx(embedding))
    `);
    console.log("✅ Índice vetorial verificado.");
  } catch (e) {
    console.warn(
      "⚠️ Aviso ao criar índice vetorial (pode já existir ou não suportado):",
      e,
    );
  }

  console.log("✅ Tabela document_chunks e índices verificados.");
}
