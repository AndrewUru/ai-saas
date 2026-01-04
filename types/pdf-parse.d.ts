declare module "pdf-parse" {
  export type PDFParseResult = {
    text?: string;
    numpages?: number;
    info?: unknown;
    metadata?: unknown;
    version?: string;
  };

  export default function pdfParse(
    data: Buffer | Uint8Array | ArrayBuffer
  ): Promise<PDFParseResult>;
}
