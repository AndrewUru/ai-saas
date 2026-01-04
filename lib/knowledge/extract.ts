import Papa from "papaparse";
import pdfParse from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text ?? "";
}

export async function extractTextFromCsv(buffer: Buffer): Promise<string> {
  const csvText = buffer.toString("utf-8");
  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const lines = (parsed.data ?? [])
    .map((row) => {
      const parts = Object.entries(row)
        .map(([key, value]) => {
          if (value === null || value === undefined) return null;
          const text = String(value).trim();
          if (!text) return null;
          return `${key}: ${text}`;
        })
        .filter(Boolean) as string[];

      return parts.join(" | ");
    })
    .filter((line) => line.trim().length > 0);

  return lines.join("\n");
}
