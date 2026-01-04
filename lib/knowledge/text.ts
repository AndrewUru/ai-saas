type ChunkOptions = {
  chunkSize?: number;
  overlap?: number;
  minChunkSize?: number;
};

export function safeFilename(input: string): string {
  const base = input.split(/[\\/]/).pop() ?? "file";
  const trimmed = base.trim();
  const normalized = trimmed.replace(/\s+/g, "-");
  const sanitized = normalized.replace(/[^a-zA-Z0-9._-]/g, "");
  return sanitized || "file";
}

export function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkText(
  input: string,
  options: ChunkOptions = {}
): string[] {
  const chunkSize = options.chunkSize ?? 1500;
  const overlap = options.overlap ?? 200;
  const minChunkSize = options.minChunkSize ?? 50;

  if (!input) return [];
  const step = Math.max(1, chunkSize - overlap);
  const chunks: string[] = [];

  for (let start = 0; start < input.length; start += step) {
    const chunk = input.slice(start, start + chunkSize).trim();
    if (chunk.length >= minChunkSize) {
      chunks.push(chunk);
    }
  }

  return chunks;
}
