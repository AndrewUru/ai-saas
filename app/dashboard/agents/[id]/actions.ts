//C:\ai-saas\app\dashboard\agents\[id]\actions.ts
"use server";

import { z } from "zod";
import { createServer } from "@/lib/supabase/server";
import { safeFilename, normalizeText, chunkText } from "@/lib/knowledge/text";
import { extractTextFromPdf, extractTextFromCsv } from "@/lib/knowledge/extract";
import { embedTexts } from "@/lib/knowledge/embed";
import { toPgVector } from "@/lib/woo/embeddings";
// opcional: import { revalidatePath } from "next/cache";
// opcional: import { redirect } from "next/navigation";

export type ActionError<E = unknown> = {
  ok: false;
  error: string;
  issues?: E;
};

export type ActionSuccess<T extends object = Record<string, never>> =
  T extends Record<string, never> ? { ok: true } : { ok: true } & T;

export type ActionResult<T extends object = Record<string, never>, E = unknown> =
  | ActionSuccess<T>
  | ActionError<E>;

export type AgentFileResponse = {
  id: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  status: string | null;
  created_at: string | null;
  error: string | null;
};

const Schema = z.object({
  id: z.string().uuid(),
  integration_woocommerce: z.string().min(1).optional(), // "none"|"basic"|...
  allowed_domains: z.string().optional(), // "midominio.com,tienda.com"
});

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const EMBEDDING_BATCH_SIZE = 50;
const CHUNK_INSERT_BATCH_SIZE = 200;
const DEFAULT_CHUNK_SIZE = 1500;
const DEFAULT_CHUNK_OVERLAP = 200;
const MIN_CHUNK_SIZE = 50;
const FILE_SELECT =
  "id, filename, mime_type, size_bytes, status, created_at, error";

type AgentFileRow = AgentFileResponse;
type OwnedAgentRow = { id: string; user_id: string };

async function getOwnedAgent(
  supabase: Awaited<ReturnType<typeof createServer>>,
  agentId: string,
  userId: string
): Promise<ActionResult<{ agent: OwnedAgentRow }>> {
  const { data: agent, error } = await supabase
    .from("agents")
    .select("id,user_id")
    .eq("id", agentId)
    .single();

  if (error || !agent) {
    return { ok: false as const, error: "Agent not found." };
  }
  if (agent.user_id !== userId) {
    return { ok: false as const, error: "Unauthorized for this agent." };
  }

  return { ok: true as const, agent };
}

function isAllowedFileType(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  const isPdf = name.endsWith(".pdf") || type.includes("pdf");
  const isCsv = name.endsWith(".csv") || type.includes("csv");
  return { isPdf, isCsv, ok: isPdf || isCsv };
}

function toSafeFileResponse(row: AgentFileRow): AgentFileResponse {
  return {
    id: row.id,
    filename: row.filename,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    status: row.status,
    created_at: row.created_at,
    error: row.error,
  };
}

export async function saveAgentSettings(
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "No autenticado" };

    const parsed = Schema.safeParse({
      id: String(formData.get("id") ?? ""),
      integration_woocommerce: String(
        formData.get("integration_woocommerce") ?? "none"
      ),
      allowed_domains: String(formData.get("allowed_domains") ?? "").trim(),
    });
    if (!parsed.success) {
      return {
        ok: false,
        error: "Datos inválidos",
        issues: parsed.error.flatten(),
      };
    }
    const { id, integration_woocommerce, allowed_domains } = parsed.data;

    // (opcional) normaliza lista
    const normalized = allowed_domains
      ? allowed_domains
          .split(",")
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean)
          .join(",")
      : null;

    // Verifica ownership explícito (evita 303 con error genérico)
    const { data: agent, error: qErr } = await supabase
      .from("agents")
      .select("id,user_id")
      .eq("id", id)
      .single();

    if (qErr || !agent) return { ok: false, error: "Agente no encontrado" };
    if (agent.user_id !== user.id)
      return { ok: false, error: "Sin permiso sobre el agente" };

    // Update: requiere política RLS de UPDATE correcta
    const { error: updErr } = await supabase
      .from("agents")
      .update({
        integration_woocommerce,
        allowed_domains: normalized,
      })
      .eq("id", id);

    if (updErr) {
      console.error("Supabase update error:", updErr);
      return { ok: false, error: updErr.message || "No se pudo guardar" };
    }

    // opcional: revalidatePath(`/agents/${id}`);
    // opcional: redirect(`/agents/${id}?saved=1`);

    return { ok: true };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: message };
  }
}

export async function listAgentFiles(
  agentId: string
): Promise<ActionResult<{ files: AgentFileResponse[] }>> {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const owned = await getOwnedAgent(supabase, agentId, user.id);
    if (!owned.ok) return { ok: false, error: owned.error };

    const { data, error } = await supabase
      .from("agent_files")
      .select(FILE_SELECT)
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase list files error:", error);
      return { ok: false, error: error.message };
    }

    const rows = (data ?? []) as AgentFileRow[];
    return { ok: true, files: rows.map(toSafeFileResponse) };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return { ok: false, error: message };
  }
}

export async function uploadAgentFile(
  agentId: string,
  formData: FormData
): Promise<ActionResult<{ file: AgentFileResponse }>> {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const owned = await getOwnedAgent(supabase, agentId, user.id);
    if (!owned.ok) return { ok: false, error: owned.error };

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "No file uploaded." };
    }

    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: "File exceeds 10MB limit." };
    }

    const typeCheck = isAllowedFileType(file);
    if (!typeCheck.ok) {
      return { ok: false, error: "Only PDF or CSV files are supported." };
    }

    const safeName = safeFilename(file.name);
    const fallbackType = typeCheck.isPdf ? "application/pdf" : "text/csv";

    const { data: inserted, error: insertError } = await supabase
      .from("agent_files")
      .insert({
        user_id: user.id,
        agent_id: agentId,
        filename: safeName,
        mime_type: file.type || fallbackType,
        size_bytes: file.size,
        status: "uploaded",
      })
      .select(FILE_SELECT)
      .single();

    if (insertError || !inserted) {
      console.error("Supabase insert file error:", insertError);
      return { ok: false, error: "Could not save file record." };
    }

    const storagePath = `user/${user.id}/agent/${agentId}/${inserted.id}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("agent-files")
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type || fallbackType,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      await supabase
        .from("agent_files")
        .update({ status: "failed", error: uploadError.message })
        .eq("id", inserted.id)
        .eq("agent_id", agentId);
      return { ok: false, error: uploadError.message };
    }

    const { data: updated, error: updateError } = await supabase
      .from("agent_files")
      .update({ storage_path: storagePath })
      .eq("id", inserted.id)
      .eq("agent_id", agentId)
      .select(FILE_SELECT)
      .single();

    if (updateError || !updated) {
      console.error("Supabase update file error:", updateError);
      return { ok: false, error: "File uploaded, but update failed." };
    }

    return { ok: true, file: toSafeFileResponse(updated as AgentFileRow) };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return { ok: false, error: message };
  }
}

export async function processAgentFile(
  agentId: string,
  fileId: string
): Promise<ActionResult> {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const owned = await getOwnedAgent(supabase, agentId, user.id);
  if (!owned.ok) return { ok: false, error: owned.error };

  const { data: file, error: fileError } = await supabase
    .from("agent_files")
    .select("id, filename, mime_type, storage_path")
    .eq("id", fileId)
    .eq("agent_id", agentId)
    .single();

  if (fileError || !file) {
    return { ok: false, error: "File not found." };
  }

  if (!file.storage_path) {
    return { ok: false, error: "File is missing a storage path." };
  }

  const { error: statusError } = await supabase
    .from("agent_files")
    .update({
      status: "processing",
      error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId)
    .eq("agent_id", agentId);

  if (statusError) {
    console.error("Supabase status update error:", statusError);
    return { ok: false, error: statusError.message };
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("Missing OPENAI_API_KEY for embeddings.");
    }

    const { data: storedFile, error: downloadError } = await supabase.storage
      .from("agent-files")
      .download(file.storage_path);

    if (downloadError || !storedFile) {
      throw new Error(downloadError?.message || "Failed to download file.");
    }

    const buffer = Buffer.from(await storedFile.arrayBuffer());
    const lowerName = file.filename.toLowerCase();
    const mimeType = file.mime_type?.toLowerCase() ?? "";
    const isPdf = lowerName.endsWith(".pdf") || mimeType.includes("pdf");
    const isCsv = lowerName.endsWith(".csv") || mimeType.includes("csv");

    if (!isPdf && !isCsv) {
      throw new Error("Unsupported file type.");
    }

    const rawText = isPdf
      ? await extractTextFromPdf(buffer)
      : await extractTextFromCsv(buffer);
    const normalized = normalizeText(rawText);
    const chunks = chunkText(normalized, {
      chunkSize: DEFAULT_CHUNK_SIZE,
      overlap: DEFAULT_CHUNK_OVERLAP,
      minChunkSize: MIN_CHUNK_SIZE,
    });

    if (!chunks.length) {
      throw new Error("No usable text found in the file.");
    }

    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
      const batchEmbeddings = await embedTexts(openaiApiKey, batch);
      embeddings.push(...batchEmbeddings);
    }

    if (embeddings.length !== chunks.length) {
      throw new Error("Embedding count mismatch.");
    }

    const { error: deleteError } = await supabase
      .from("agent_file_chunks")
      .delete()
      .eq("file_id", fileId)
      .eq("agent_id", agentId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const rows = chunks.map((content, index) => ({
      agent_id: agentId,
      file_id: fileId,
      chunk_index: index,
      content,
      embedding: toPgVector(embeddings[index]),
    }));

    for (let i = 0; i < rows.length; i += CHUNK_INSERT_BATCH_SIZE) {
      const batch = rows.slice(i, i + CHUNK_INSERT_BATCH_SIZE);
      const { error: insertError } = await supabase
        .from("agent_file_chunks")
        .insert(batch);
      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    const { error: doneError } = await supabase
      .from("agent_files")
      .update({
        status: "ready",
        error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("agent_id", agentId);

    if (doneError) {
      throw new Error(doneError.message);
    }

    return { ok: true };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Processing failed.";
    await supabase
      .from("agent_files")
      .update({
        status: "failed",
        error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("agent_id", agentId);
    return { ok: false, error: message };
  }
}

export async function deleteAgentFile(
  agentId: string,
  fileId: string
): Promise<ActionResult> {
  try {
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const owned = await getOwnedAgent(supabase, agentId, user.id);
    if (!owned.ok) return { ok: false, error: owned.error };

    const { data: file, error: fileError } = await supabase
      .from("agent_files")
      .select("id, storage_path")
      .eq("id", fileId)
      .eq("agent_id", agentId)
      .single();

    if (fileError || !file) {
      return { ok: false, error: "File not found." };
    }

    if (file.storage_path) {
      const { error: removeError } = await supabase.storage
        .from("agent-files")
        .remove([file.storage_path]);
      if (removeError) {
        return { ok: false, error: removeError.message };
      }
    }

    const { error: chunkError } = await supabase
      .from("agent_file_chunks")
      .delete()
      .eq("file_id", fileId)
      .eq("agent_id", agentId);

    if (chunkError) {
      return { ok: false, error: chunkError.message };
    }

    const { error: deleteError } = await supabase
      .from("agent_files")
      .delete()
      .eq("id", fileId)
      .eq("agent_id", agentId);

    if (deleteError) {
      return { ok: false, error: deleteError.message };
    }

    return { ok: true };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return { ok: false, error: message };
  }
}
