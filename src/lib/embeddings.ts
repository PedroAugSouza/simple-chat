import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBED_BATCH_SIZE = 20;

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });

  return embedding;
}

export async function generateEmbeddingsForChunks(
  chunks: string[]
): Promise<{ chunk: string; embedding: number[] }[]> {
  const results: { chunk: string; embedding: number[] }[] = [];

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: batch,
    });

    for (let j = 0; j < batch.length; j++) {
      results.push({ chunk: batch[j], embedding: embeddings[j] });
    }
  }

  return results;
}
