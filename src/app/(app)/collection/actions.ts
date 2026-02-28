"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { turso } from "@/lib/turso";
import { getSupabase } from "@/lib/supabase";
import { extractText } from "@/lib/document-parser";
import { chunkText, generateEmbeddingsForChunks } from "@/lib/embeddings";
import { getSessionServer } from "@/utils/get-session.server";
import { randomUUID } from "crypto";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type DocumentType = "PDF" | "DOCX" | "MD" | "TXT";

interface UploadResult {
  success: boolean;
  document?: {
    id: string;
    title: string;
    type: DocumentType;
    size: number;
    contentPreview: string | null;
    createdAt: Date;
  };
  error?: string;
}

function getDocumentType(filename: string): DocumentType | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "PDF";
    case "docx":
      return "DOCX";
    case "md":
      return "MD";
    case "txt":
      return "TXT";
    default:
      return null;
  }
}

function removeExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

export async function uploadDocument(
  formData: FormData,
): Promise<UploadResult> {
  try {
    const session = await getSessionServer();
    if (!session) {
      return { success: false, error: "Não autorizado" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Arquivo muito grande (máx. 10MB)" };
    }

    const type = getDocumentType(file.name);
    if (!type) {
      return { success: false, error: "Tipo de arquivo não suportado" };
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload para Supabase Storage
    const storagePath = `${session.id}/${randomUUID()}_${file.name}`;
    const { error: storageError } = await getSupabase().storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
      });

    if (storageError) {
      console.error("Supabase Storage upload error:", storageError);
      return { success: false, error: "Erro ao salvar arquivo" };
    }

    // Extrair texto
    console.log(`Extracting text from ${file.name} (${type})...`);
    const text = await extractText(buffer, type);
    console.log(`Extracted ${text.length} characters.`);
    const contentPreview = text.slice(0, 500);

    // Salvar no PostgreSQL com título limpo (sem extensão)
    const title = removeExtension(file.name);
    const document = await prisma.document.create({
      data: {
        title,
        type,
        size: file.size,
        path: storagePath,
        contentPreview,
        userId: session.id,
      },
    });
    console.log(`Document created in Postgres with ID: ${document.id}`);

    // Chunking e embeddings
    const chunks = chunkText(text);
    console.log(`Text split into ${chunks.length} chunks.`);

    if (chunks.length === 0) {
      console.warn("No chunks were generated. Document might be empty or unreadable.");
      return { success: true, document: { ...document, title: document.title, type: document.type as DocumentType } };
    }

    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const embeddingsData = await generateEmbeddingsForChunks(chunks);
    console.log("Embeddings generated successfully.");

    console.log(`Saving ${embeddingsData.length} chunks to Turso...`);

    // Inserir no Turso em batch
    await turso.batch(
      embeddingsData.map(({ chunk, embedding }) => ({
        sql: `INSERT INTO document_chunks (id, userId, documentId, content, embedding) VALUES (?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          session.id,
          document.id,
          chunk,
          new Float32Array(embedding).buffer,
        ],
      })),
      "write",
    );
    console.log(`Successfully saved ${embeddingsData.length} chunks to Turso.`);

    revalidatePath("/(app)/collection");

    return {
      success: true,
      document: {
        id: document.id,
        title: document.title,
        type: document.type as DocumentType,
        size: document.size,
        contentPreview: document.contentPreview,
        createdAt: document.createdAt,
      },
    };
  } catch (error) {
    console.error("Upload process failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error processing file",
    };
  }
}

export async function getDocuments() {
  try {
    const session = await getSessionServer();
    if (!session) {
      throw new Error("Não autorizado");
    }

    const documents = await prisma.document.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        size: true,
        contentPreview: true,
        createdAt: true,
      },
    });

    return { success: true, documents };
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return { success: false, error: "Erro ao buscar documentos" };
  }
}

const deleteDocumentSchema = z.object({
  documentId: z.cuid(),
});

export async function deleteDocument(documentId: string) {
  try {
    const parsed = deleteDocumentSchema.safeParse({ documentId });
    if (!parsed.success) {
      return { success: false, error: "ID de documento inválido" };
    }

    const session = await getSessionServer();
    if (!session) {
      return { success: false, error: "Não autorizado" };
    }

    // Buscar documento
    const document = await prisma.document.findFirst({
      where: { id: parsed.data.documentId, userId: session.id },
    });

    if (!document) {
      return { success: false, error: "Documento não encontrado" };
    }

    // Deletar arquivo do Supabase Storage
    const { error: storageError } = await getSupabase().storage
      .from("documents")
      .remove([document.path]);

    if (storageError) {
      console.warn("Erro ao deletar arquivo do storage, ignorando:", storageError);
    }

    // Deletar do PostgreSQL
    await prisma.document.delete({
      where: { id: parsed.data.documentId },
    });

    try {
      // Deletar do Turso
      await turso.execute({
        sql: `DELETE FROM document_chunks WHERE documentId = ? AND userId = ?`,
        args: [parsed.data.documentId, session.id],
      });
    } catch (error) {
      console.error("Erro ao deletar chunks do Turso:", error);
    }
    revalidatePath("/(app)/collection");

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return { success: false, error: "Erro ao deletar documento" };
  }
}
