import OpenAI from "openai";

const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

export async function embedTexts(
  openaiApiKey: string,
  texts: string[]
): Promise<number[][]> {
  if (!openaiApiKey) {
    throw new Error("Missing OPENAI_API_KEY for embeddings.");
  }

  if (!texts.length) return [];

  const client = new OpenAI({ apiKey: openaiApiKey });
  const response = await client.embeddings.create({
    model: DEFAULT_EMBEDDING_MODEL,
    input: texts,
  });

  const sorted = [...response.data].sort((a, b) => a.index - b.index);
  return sorted.map((item) => item.embedding);
}
