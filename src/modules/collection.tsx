"use client";
import { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  Upload,
  Loader2,
  Trash2,
  File,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { uploadDocument, deleteDocument } from "@/app/(app)/collection/actions";

type UploadPhase = "idle" | "uploading" | "processing" | "done";

const PHASE_LABELS: Record<Exclude<UploadPhase, "idle">, string> = {
  uploading: "Enviando arquivo...",
  processing: "Extraindo texto, gerando embeddings e salvando...",
  done: "Concluído!",
};

interface Document {
  id: string;
  title: string;
  type: "PDF" | "DOCX" | "MD" | "TXT";
  size: number;
  contentPreview: string | null;
  createdAt: Date | string;
}

interface CollectionProps {
  initialDocuments: Document[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type: Document["type"]) {
  const className = "h-5 w-5";
  switch (type) {
    case "PDF":
      return <FileText className={`${className} text-rose-500`} />;
    case "DOCX":
      return <FileText className={`${className} text-blue-500`} />;
    case "MD":
      return <FileText className={`${className} text-emerald-500`} />;
    case "TXT":
      return <FileText className={`${className} text-slate-500`} />;
    default:
      return <File className={className} />;
  }
}

export function Collection({ initialDocuments }: CollectionProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sincroniza estado local quando o servidor retorna dados novos via refresh()
  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const uploading = uploadPhase !== "idle";

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        setUploadPhase("uploading");

        // Server action handles parsing + embedding + saving
        setUploadPhase("processing");
        const result = await uploadDocument(formData);

        if (result.success && result.document) {
          setDocuments((prev) => {
            const exists = prev.some((d) => d.id === result.document?.id);
            if (exists) return prev;
            return [result.document!, ...prev];
          });
          toast.success(`"${file.name}" enviado com sucesso.`);
        } else {
          toast.error(result.error || "Falha ao enviar arquivo.");
        }
      }

      setUploadPhase("done");
    } catch {
      // Server action pode ter concluído mesmo com timeout no client.
      // O router.refresh() no finally sincroniza o estado real.
    } finally {
      // Sempre sincroniza com o servidor, mesmo se houve erro
      // (o servidor pode ter concluído a operação antes do timeout)
      router.refresh();
      setTimeout(() => {
        setUploadPhase("idle");
      }, 800);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  const handleDelete = (documentId: string) => {
    setDeletingId(documentId);
    startDeleteTransition(async () => {
      await deleteDocument(documentId);
      router.refresh();
      setDeletingId(null);
    });
  };

  return (
    <main className="container mx-auto py-10 px-6 max-w-5xl h-full flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Meu Acervo
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus materiais de estudo para conversas com IA fundamentada.
            </p>
          </div>
        </div>
        {documents.length > 0 && (
          <div className="text-xs font-medium text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full border">
            {documents.length}{" "}
            {documents.length === 1 ? "Documento" : "Documentos"}
          </div>
        )}
      </header>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
            mb-8 border border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ease-in-out
            ${isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/50"}
            ${uploading ? "opacity-80 cursor-not-allowed border-primary/30 bg-primary/5" : ""}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
              <Upload className="h-5 w-5 text-primary absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {PHASE_LABELS[uploadPhase as Exclude<UploadPhase, "idle">]}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-background p-3 rounded-full shadow-sm border group-hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isDragActive ? "Solte os arquivos aqui" : "Clique ou arraste para enviar"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, MD, TXT (Max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-auto">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-300 rounded-xl bg-white border-dashed">
            <div className="bg-background p-4 rounded-full border mb-4">
              <File
                className="h-8 w-8 text-muted-foreground/40"
                strokeWidth={1}
              />
            </div>
            <h3 className="font-medium text-lg text-foreground">
              Seu acervo está vazio
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              Envie documentos para dar contexto às suas sessões de estudo com IA.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="group overflow-hidden border border-zinc-300 bg-white hover:shadow-md transition-all hover:border-zinc-400 flex flex-col"
              >
                <CardHeader className="p-4 pb-2 space-y-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 bg-accent/50 rounded-md">
                      {getFileIcon(doc.type)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <CardTitle
                    className="text-sm font-semibold leading-tight mt-4 line-clamp-2 min-h-10"
                    title={doc.title}
                  >
                    {doc.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 mt-auto">
                  <div className="flex items-center text-[11px] text-muted-foreground gap-2">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {doc.type}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(doc.size)}</span>
                    <span>•</span>
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
