import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
// Vite: import worker as URL for pdf.js
// Using the ESM worker build shipped with pdfjs-dist
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite will inline the worker URL at build time
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";

GlobalWorkerOptions.workerSrc = workerSrc as unknown as string;

export interface PdfHighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfHighlight {
  page: number;
  text: string;
  rects: PdfHighlightRect[];
  color?: { r: number; g: number; b: number } | null;
  comment?: string | null;
}

function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function quadPointsToRects(quadPoints: number[]): PdfHighlightRect[] {
  const rects: PdfHighlightRect[] = [];
  for (let i = 0; i < quadPoints.length; i += 8) {
    const x1 = quadPoints[i + 0];
    const y1 = quadPoints[i + 1];
    const x2 = quadPoints[i + 2];
    const y2 = quadPoints[i + 3];
    const x3 = quadPoints[i + 4];
    const y3 = quadPoints[i + 5];
    const x4 = quadPoints[i + 6];
    const y4 = quadPoints[i + 7];
    const minX = Math.min(x1, x2, x3, x4);
    const maxX = Math.max(x1, x2, x3, x4);
    const minY = Math.min(y1, y2, y3, y4);
    const maxY = Math.max(y1, y2, y3, y4);
    rects.push({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
  }
  return rects;
}

function rectsIntersect(a: PdfHighlightRect, b: PdfHighlightRect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export async function extractPdfHighlights(file: File): Promise<PdfHighlight[]> {
  const buffer = await fileToArrayBuffer(file);
  const loadingTask = getDocument({ data: buffer });
  const pdf: PDFDocumentProxy = await loadingTask.promise;
  const highlights: PdfHighlight[] = [];

  const numPages = pdf.numPages;
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const [annots, textContent] = await Promise.all([
      page.getAnnotations(),
      page.getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false }),
    ]);

    // Precompute text item rects
    type TextItem = (typeof textContent.items)[number] & { width?: number } & { transform: number[] } & { str: string };
    const textRects = (textContent.items as TextItem[]).map((item) => {
      const t = item.transform;
      const x = t[4];
      const y = t[5];
      const a = t[0], b = t[1], c = t[2], d = t[3];
      const height = Math.max(1, Math.abs(d) + Math.abs(b));
      const width = (item as any).width ?? Math.sqrt(a * a + c * c) * (item.str?.length || 1) * 0.6;
      const rect: PdfHighlightRect = { x, y, width, height };
      return { rect, text: item.str };
    });

    for (const a of annots) {
      if ((a as any).subtype === "Highlight" && Array.isArray((a as any).quadPoints) && (a as any).quadPoints.length >= 8) {
        const rects = quadPointsToRects((a as any).quadPoints as number[]);
        const collected: { text: string; x: number; y: number }[] = [];

        for (const r of rects) {
          for (const ti of textRects) {
            if (rectsIntersect(r, ti.rect)) {
              collected.push({ text: ti.text, x: ti.rect.x, y: ti.rect.y });
            }
          }
        }

        collected.sort((p, q) => (q.y === p.y ? p.x - q.x : q.y - p.y));
        const mergedText = collected.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
        const color = Array.isArray((a as any).color) && (a as any).color.length >= 3
          ? { r: (a as any).color[0], g: (a as any).color[1], b: (a as any).color[2] }
          : null;

        if (mergedText || (a as any).contents) {
          highlights.push({
            page: pageNum,
            text: mergedText || String((a as any).contents || ""),
            rects,
            color,
            comment: (a as any).contents || null,
          });
        }
      }
    }
  }

  try { await pdf.destroy(); } catch {}
  return highlights;
}
