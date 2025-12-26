const DEFAULT_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const MAX_CACHE_ENTRIES = 500;
const embeddingCache = new Map<string, number[]>();

function cacheSet(key: string, value: number[]) {
  if (embeddingCache.has(key)) {
    embeddingCache.delete(key);
  }
  embeddingCache.set(key, value);
  if (embeddingCache.size > MAX_CACHE_ENTRIES) {
    const first = embeddingCache.keys().next().value as string | undefined;
    if (first) embeddingCache.delete(first);
  }
}

export function toPgVector(values: number[]) {
  return `[${values.join(",")}]`;
}

export async function embedTexts(texts: string[], apiKey: string) {
  const pending: Array<{ text: string; index: number }> = [];
  const results: number[][] = new Array(texts.length);

  texts.forEach((text, index) => {
    const cached = embeddingCache.get(text);
    if (cached) {
      results[index] = cached;
    } else {
      pending.push({ text, index });
    }
  });

  if (!pending.length) return results;

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_EMBEDDING_MODEL,
      input: pending.map((item) => item.text),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Embedding error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    data?: Array<{ embedding: number[] }>;
  };

  data.data?.forEach((item, idx) => {
    const target = pending[idx];
    if (!target) return;
    results[target.index] = item.embedding;
    cacheSet(target.text, item.embedding);
  });

  return results;
}

export async function embedText(text: string, apiKey: string) {
  const [embedding] = await embedTexts([text], apiKey);
  return embedding;
}
