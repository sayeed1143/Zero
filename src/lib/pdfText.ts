import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
// Vite: import worker as URL for pdf.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite will inline the worker URL at build time
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";

GlobalWorkerOptions.workerSrc = workerSrc as unknown as string;

export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf: PDFDocumentProxy = await loadingTask.promise;

  let fullText = "";
  const numPages = pdf.numPages;
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false });
    const pageText = (textContent.items as any[])
      .map((it) => (typeof it.str === "string" ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) {
      fullText += `\n\n[Page ${pageNum}] ${pageText}`;
    }
  }

  try { await pdf.destroy(); } catch {}
  return fullText.trim();
}
