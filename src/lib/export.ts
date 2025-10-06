export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const { width } = ctx.measureText(test);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function exportTextAsPNG(text: string, filename = "chat.png") {
  const dpi = 2; // high-res
  const width = 900;
  const padding = 28;
  const lineHeight = 24;
  const bubbleRadius = 18;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.font = "16px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  const lines = wrapText(ctx, text, width - padding * 2);
  const textHeight = lines.length * lineHeight;
  const height = textHeight + padding * 2;

  canvas.width = width * dpi;
  canvas.height = height * dpi;
  ctx.scale(dpi, dpi);

  // background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // bubble
  const bubbleX = 12;
  const bubbleY = 12;
  const bubbleW = width - 24;
  const bubbleH = height - 24;
  const r = bubbleRadius;
  ctx.fillStyle = "#f3f4f6"; // muted light gray
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bubbleX + r, bubbleY);
  ctx.arcTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + bubbleH, r);
  ctx.arcTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH, r);
  ctx.arcTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY, r);
  ctx.arcTo(bubbleX, bubbleY, bubbleX + bubbleW, bubbleY, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // text
  ctx.fillStyle = "#111827";
  ctx.textBaseline = "top";
  let y = padding + 4;
  for (const line of lines) {
    ctx.fillText(line, padding + 8, y);
    y += lineHeight;
  }

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function openPrintForText(text: string, title = "Chat Export") {
  const html = `<!doctype html><html><head><meta charset=\"utf-8\"/>
    <title>${title}</title>
    <style>
      body{font:16px Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif; color:#111; margin:40px;}
      .bubble{background:#f3f4f6; border:1px solid #e5e7eb; border-radius:18px; padding:20px;}
      @media print { body { margin: 12mm; } }
    </style>
  </head><body>
    <div class="bubble">${text.replace(/\n/g, "<br/>")}</div>
    <script>window.onload = () => setTimeout(() => window.print(), 50);</script>
  </body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export function downloadJSON(data: any, filename = "quiz.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
