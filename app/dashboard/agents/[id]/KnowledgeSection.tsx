"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteAgentFile,
  listAgentFiles,
  processAgentFile,
  uploadAgentFile,
} from "./actions";

type ListFilesResult = Awaited<ReturnType<typeof listAgentFiles>>;
type AgentFileItem = Extract<ListFilesResult, { ok: true }>["files"][number];

type Notice = {
  type: "success" | "error";
  message: string;
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_STYLES: Record<string, string> = {
  uploaded: "border-slate-700 text-slate-300",
  processing: "border-amber-500/40 text-amber-200",
  ready: "border-emerald-500/40 text-emerald-200",
  failed: "border-rose-500/40 text-rose-200",
};

function formatBytes(bytes: number | null) {
  if (!bytes && bytes !== 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type KnowledgeSectionProps = {
  agentId: string;
};

export default function KnowledgeSection({ agentId }: KnowledgeSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<AgentFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<Notice | null>(null);

  const refreshFiles = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      const result = await listAgentFiles(agentId);
      if (result.ok) {
        setFiles(result.files);
      } else {
        setNotice({ type: "error", message: result.error });
      }
      if (!silent) setLoading(false);
    },
    [agentId]
  );

  useEffect(() => {
    void refreshFiles();
  }, [refreshFiles]);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setNotice({
        type: "error",
        message: "Select a PDF or CSV file to upload.",
      });
      return;
    }

    setUploading(true);
    setNotice(null);

    const formData = new FormData();
    formData.set("file", file);

    const result = await uploadAgentFile(agentId, formData);
    setUploading(false);

    if (!result.ok) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    setNotice({ type: "success", message: "File uploaded successfully." });
    if (fileInputRef.current) fileInputRef.current.value = "";
    await refreshFiles(true);
  };

  const handleProcess = async (fileId: string) => {
    setProcessing((prev) => ({ ...prev, [fileId]: true }));
    setNotice(null);

    const result = await processAgentFile(agentId, fileId);
    setProcessing((prev) => ({ ...prev, [fileId]: false }));

    if (!result.ok) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    setNotice({ type: "success", message: "File indexed successfully." });
    await refreshFiles(true);
  };

  const handleDelete = async (fileId: string) => {
    setDeleting((prev) => ({ ...prev, [fileId]: true }));
    setNotice(null);

    const result = await deleteAgentFile(agentId, fileId);
    setDeleting((prev) => ({ ...prev, [fileId]: false }));

    if (!result.ok) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    setNotice({ type: "success", message: "File deleted." });
    await refreshFiles(true);
  };

  return (
    <article className="lg:col-span-2 w-full min-w-0 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-xl shadow-slate-900/40 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Knowledge (PDF/CSV)
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Upload documents to ground agent responses with your merchant data.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.csv"
          className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-400/60 disabled:text-slate-950/60 disabled:hover:bg-emerald-400/60"
        >
          {uploading && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"
              aria-hidden="true"
            />
          )}
          <span>{uploading ? "Uploading\u2026" : "Upload file"}</span>
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Max file size 10MB. Supported formats: PDF, CSV.
      </p>

      {notice && (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-xs ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              : "border-rose-500/30 bg-rose-500/10 text-rose-100"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading && (
          <p className="text-xs text-slate-400">Loading knowledge files\u2026</p>
        )}
        {!loading && files.length === 0 && (
          <p className="text-xs text-slate-400">
            No knowledge files uploaded yet.
          </p>
        )}
        {files.map((file) => {
          const statusKey = (file.status ?? "uploaded").toLowerCase();
          const statusLabel = STATUS_LABELS[statusKey] ?? "Unknown";
          const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.uploaded;
          const isProcessing = !!processing[file.id];
          const isDeleting = !!deleting[file.id];
          const isBusy = isProcessing || isDeleting || uploading;
          const processLabel = statusKey === "ready" ? "Re-index" : "Process";

          return (
            <div
              key={file.id}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {file.filename}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatBytes(file.size_bytes)}{" - "}
                    {formatDate(file.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusStyle}`}
                  >
                    {statusLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleProcess(file.id)}
                    disabled={isBusy || statusKey === "processing"}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                  >
                    {isProcessing && (
                      <span
                        className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600/40 border-t-slate-200"
                        aria-hidden="true"
                      />
                    )}
                    {isProcessing ? "Indexing\u2026" : processLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-500/40 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:border-rose-400 hover:text-rose-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                  >
                    {isDeleting && (
                      <span
                        className="h-3 w-3 animate-spin rounded-full border-2 border-rose-300/40 border-t-rose-200"
                        aria-hidden="true"
                      />
                    )}
                    {isDeleting ? "Deleting\u2026" : "Delete"}
                  </button>
                </div>
              </div>
              {file.error && (
                <p className="mt-2 text-xs text-rose-300">{file.error}</p>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
