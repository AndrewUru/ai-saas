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

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Uploaded",
  processing: "Indexing",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_STYLES: Record<string, string> = {
  uploaded: "border-slate-700/60 bg-slate-900/40 text-slate-200",
  processing: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  ready: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  failed: "border-rose-500/40 bg-rose-500/10 text-rose-200",
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

function validateFile(file: File, existingNames: string[]) {
  const lowerName = file.name.toLowerCase();
  const lowerType = file.type.toLowerCase();
  const isPdf = lowerName.endsWith(".pdf") || lowerType.includes("pdf");
  const isCsv = lowerName.endsWith(".csv") || lowerType.includes("csv");
  if (!isPdf && !isCsv) return "Only PDF or CSV files are allowed.";
  if (file.size > MAX_FILE_BYTES) return "File too large (max 10MB).";
  if (existingNames.includes(lowerName)) {
    return "A file with this name already exists.";
  }
  return null;
}

type KnowledgeSectionProps = {
  agentId: string;
};

export default function KnowledgeSection({ agentId }: KnowledgeSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [files, setFiles] = useState<AgentFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [autoProcess, setAutoProcess] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!notice) {
      setNoticeVisible(false);
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
      if (noticeDismissRef.current) {
        clearTimeout(noticeDismissRef.current);
      }
      return;
    }

    setNoticeVisible(false);
    const showTimer = setTimeout(() => {
      setNoticeVisible(true);
    }, 10);

    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }
    if (noticeDismissRef.current) {
      clearTimeout(noticeDismissRef.current);
    }

    if (notice.type === "success") {
      noticeTimerRef.current = setTimeout(() => {
        setNoticeVisible(false);
        noticeDismissRef.current = setTimeout(() => {
          setNotice(null);
        }, 200);
      }, 3500);
    }

    return () => clearTimeout(showTimer);
  }, [notice]);

  useEffect(() => {
    const hasProcessing = files.some(
      (file) => (file.status ?? "uploaded").toLowerCase() === "processing"
    );
    const hasLocalProcessing = Object.values(processing).some(Boolean);
    if (!hasProcessing && !hasLocalProcessing) return;

    const interval = window.setInterval(() => {
      void refreshFiles(true);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [files, processing, refreshFiles]);

  const dismissNotice = useCallback(() => {
    setNoticeVisible(false);
    if (noticeDismissRef.current) {
      clearTimeout(noticeDismissRef.current);
    }
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }
    noticeDismissRef.current = setTimeout(() => {
      setNotice(null);
    }, 200);
  }, []);

  const onPickFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const existingNames = files.map((item) => item.filename.toLowerCase());
      const error = validateFile(file, existingNames);
      if (error) {
        setNotice({ type: "error", message: error });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setNotice(null);
      setSelectedFile(file);
    },
    [files]
  );

  const handleUpload = async () => {
    const file = selectedFile;
    if (!file) {
      setNotice({
        type: "error",
        message: "Select a PDF or CSV file to upload.",
      });
      return;
    }

    const existingNames = files.map((item) => item.filename.toLowerCase());
    const validationError = validateFile(file, existingNames);
    if (validationError) {
      setNotice({ type: "error", message: validationError });
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

    if (autoProcess) {
      setNotice({ type: "success", message: "Upload complete. Indexing started." });
    } else {
      setNotice({ type: "success", message: "File uploaded successfully." });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedFile(null);
    await refreshFiles(true);

    if (autoProcess) {
      void handleProcess(result.file.id, {
        silentSuccess: true,
        keepNotice: true,
      });
    }
  };

  const handleProcess = async (
    fileId: string,
    options?: { silentSuccess?: boolean; keepNotice?: boolean }
  ) => {
    setProcessing((prev) => ({ ...prev, [fileId]: true }));
    if (!options?.keepNotice) {
      setNotice(null);
    }

    const result = await processAgentFile(agentId, fileId);
    setProcessing((prev) => ({ ...prev, [fileId]: false }));

    if (!result.ok) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    if (!options?.silentSuccess) {
      setNotice({ type: "success", message: "File indexed successfully." });
    }
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
    setConfirmDeleteId(null);
    await refreshFiles(true);
  };

  return (
    <article className="lg:col-span-2 w-full min-w-0 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-7 shadow-xl shadow-slate-900/40 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Knowledge files
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Upload files to improve answers with your store data.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0] ?? null;
            onPickFile(file);
          }}
          className={`rounded-2xl border bg-slate-950/50 p-4 text-left transition ${
            isDragging
              ? "border-emerald-400/60 bg-slate-900/70"
              : "border-slate-800 hover:border-emerald-400/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv"
            className="sr-only"
            onChange={(event) => onPickFile(event.target.files?.[0] ?? null)}
          />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-emerald-200">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 16V8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="m8.5 11.5 3.5-3.5 3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16.5a3.5 3.5 0 0 0 3.5 3.5h9a3.5 3.5 0 0 0 0-7h-.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {selectedFile ? "File selected" : "Drop your file here"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedFile
                    ? `${selectedFile.name} \u2022 ${formatBytes(
                        selectedFile.size
                      )}`
                    : "PDF or CSV up to 10MB. Click to browse."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
            >
              {selectedFile ? "Change file" : "Browse"}
            </button>
          </div>
          {selectedFile && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onPickFile(null);
                }}
                className="text-xs text-slate-400 transition hover:text-slate-200"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-400/60 disabled:text-slate-950/60 disabled:hover:bg-emerald-400/60"
        >
          {uploading && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"
              aria-hidden="true"
            />
          )}
          <span>{uploading ? "Uploading\u2026" : "Upload"}</span>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <label className="inline-flex items-center gap-2 text-slate-300">
          <input
            type="checkbox"
            checked={autoProcess}
            onChange={(event) => setAutoProcess(event.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-400 focus:ring-emerald-400/40"
          />
          Index automatically after upload
        </label>
        <span className="text-slate-500">
          Max file size 10MB. Supported formats: PDF, CSV.
        </span>
      </div>

      {notice && (
        <div
          className={`mt-4 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-xs transition duration-200 ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              : "border-rose-500/30 bg-rose-500/10 text-rose-100"
          } ${noticeVisible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={dismissNotice}
            className="text-sm text-current/70 transition hover:text-current"
            aria-label="Dismiss notice"
          >
            \u00d7
          </button>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {loading && (
          <p className="text-xs text-slate-400">Loading knowledge files\u2026</p>
        )}
        {!loading && files.length === 0 && (
          <p className="text-xs text-slate-400">
            No knowledge files uploaded yet.
          </p>
        )}
        {!loading && files.length > 0 && (
          <div className="hidden sm:grid sm:grid-cols-[minmax(0,2.4fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>File</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
        )}
        {files.map((file) => {
          const statusKey = (file.status ?? "uploaded").toLowerCase();
          const statusLabel = STATUS_LABELS[statusKey] ?? "Unknown";
          const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.uploaded;
          const isProcessing = !!processing[file.id];
          const isDeleting = !!deleting[file.id];
          const isBusy = isProcessing || isDeleting || uploading;
          const processLabel = statusKey === "ready" ? "Re-index" : "Process";
          const isIndexing = statusKey === "processing" || isProcessing;

          return (
            <div
              key={file.id}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4"
            >
              <div className="hidden sm:grid sm:grid-cols-[minmax(0,2.4fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:items-center sm:gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {file.filename}
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  {formatBytes(file.size_bytes)}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(file.created_at)}
                </p>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle}`}
                  >
                    {statusLabel}
                  </span>
                  {isIndexing && (
                    <div className="mt-2 space-y-1">
                      <div className="relative h-1 overflow-hidden rounded-full bg-slate-800">
                        <div className="absolute inset-y-0 w-1/2 animate-pulse rounded-full bg-amber-400/70" />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Indexing\u2026 this can take ~30\u201390s
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleProcess(file.id)}
                    disabled={isBusy || statusKey === "processing"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {isProcessing && (
                      <span
                        className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-900"
                        aria-hidden="true"
                      />
                    )}
                    {isProcessing ? "Indexing\u2026" : processLabel}
                  </button>
                  <details className="relative">
                    <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-slate-800 text-slate-300 transition hover:border-slate-600 hover:text-white [&::-webkit-details-marker]:hidden">
                      \u22ef
                    </summary>
                    <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-slate-800 bg-slate-950/90 p-2 text-xs shadow-xl shadow-slate-950/60 backdrop-blur">
                      <button
                        type="button"
                        onClick={(event) => {
                          const details = event.currentTarget.closest("details");
                          if (details) details.removeAttribute("open");
                          setConfirmDeleteId(file.id);
                        }}
                        disabled={isBusy}
                        className="w-full rounded-lg px-3 py-2 text-left text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:text-slate-500"
                      >
                        Delete
                      </button>
                    </div>
                  </details>
                </div>
              </div>
              <div className="space-y-2 sm:hidden">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {file.filename}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatBytes(file.size_bytes)}{" \u2022 "}
                    {formatDate(file.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle}`}
                  >
                    {statusLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleProcess(file.id)}
                    disabled={isBusy || statusKey === "processing"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {isProcessing && (
                      <span
                        className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400/40 border-t-slate-900"
                        aria-hidden="true"
                      />
                    )}
                    {isProcessing ? "Indexing\u2026" : processLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(file.id)}
                    disabled={isBusy}
                    className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                  >
                    Delete
                  </button>
                </div>
                {isIndexing && (
                  <div className="space-y-1">
                    <div className="relative h-1 overflow-hidden rounded-full bg-slate-800">
                      <div className="absolute inset-y-0 w-1/2 animate-pulse rounded-full bg-amber-400/70" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Indexing\u2026 this can take ~30\u201390s
                    </p>
                  </div>
                )}
              </div>
              {confirmDeleteId === file.id && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                  <span>Delete file?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      disabled={isBusy}
                      className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-rose-500/50"
                    >
                      {isDeleting ? "Deleting\u2026" : "Delete"}
                    </button>
                  </div>
                </div>
              )}
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
