/**
 * Server-only PDF text extraction using pdf-parse (CommonJS).
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  // pdf-parse is CJS; load via require for Node route handlers.
  const pdfParse = require("pdf-parse") as (
    data: Buffer
  ) => Promise<{ text: string }>;
  const { text } = await pdfParse(buffer);
  return text?.trim() ?? "";
}
