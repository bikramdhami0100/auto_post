import { createCanvas, CanvasRenderingContext2D } from "canvas";
import { initCanvasFonts } from "./fonts";

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT_FAMILY = "ND";

let fontsInitialized = false;

async function ensureFonts(): Promise<void> {
  if (fontsInitialized) return;
  await initCanvasFonts();
  fontsInitialized = true;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = [...text];
  const lines: string[] = [];
  let current = "";
  for (const ch of chars) {
    const test = current + ch;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = ch;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateImage(
  text: string,
  title?: string,
  citation?: string
): Promise<Buffer> {
  await ensureFonts();
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const maxWidth = WIDTH * 0.8;
  const centerX = WIDTH / 2;
  let y = HEIGHT * 0.25;

  if (title) {
    ctx.font = `bold 64px ${FONT_FAMILY}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    for (const line of wrapText(ctx, title, maxWidth)) {
      ctx.fillText(line, centerX, y);
      y += 90;
    }
    y += 40;
  }

  ctx.font = `48px ${FONT_FAMILY}`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  for (const line of wrapText(ctx, text, maxWidth)) {
    ctx.fillText(line, centerX, y);
    y += 75;
  }

  if (citation) {
    y += 30;
    ctx.font = `italic 40px ${FONT_FAMILY}`;
    ctx.fillStyle = "#AAAAAA";
    ctx.textAlign = "center";
    for (const line of wrapText(ctx, citation, maxWidth)) {
      ctx.fillText(line, centerX, y);
      y += 55;
    }
  }

  return canvas.toBuffer("image/png");
}

interface LanguageRow {
  nepali: string;
  target: string;
  pronunciation: string;
  example: string;
}

export async function generateLanguageTableImage(words: LanguageRow[]): Promise<Buffer> {
  await ensureFonts();
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const margin = 40;
  const tableW = WIDTH - margin * 2;
  const colCount = 4;
  const spacing = 16;

  ctx.font = "bold 38px ND";

  // Headers and field keys
  const headerLabels = ["नेपाली", "English", "उच्चारण", "Example"];
  const fields: (keyof LanguageRow)[] = ["nepali", "target", "pronunciation", "example"];

  // Measure max width per column
  const maxWidths: number[] = [0, 0, 0, 0];
  for (let c = 0; c < colCount; c++) {
    const hW = ctx.measureText(headerLabels[c]).width;
    maxWidths[c] = hW;
    for (const w of words) {
      const tW = ctx.measureText(w[fields[c]]).width;
      if (tW > maxWidths[c]) maxWidths[c] = tW;
    }
  }

  // Distribute width proportionally
  const totalContent = maxWidths.reduce((a, b) => a + b, 0);
  const totalSpacing = spacing * (colCount - 1);
  const available = tableW - totalSpacing;
  const colWidths = maxWidths.map((w) => Math.max(w + 24, (w / totalContent) * available));
  const sum = colWidths.reduce((a, b) => a + b, 0);
  for (let c = 0; c < colCount; c++) {
    colWidths[c] = (colWidths[c] / sum) * available;
  }

  // Column positions
  const colStarts: number[] = [];
  let curX = margin;
  for (let c = 0; c < colCount; c++) {
    colStarts.push(curX);
    curX += colWidths[c] + spacing;
  }
  const colCenters = colStarts.map((s, i) => s + colWidths[i] / 2);

  // Table layout
  const headerY = 200;
  const rowH = 110;
  const firstRowY = 320;
  const tableBottom = firstRowY + words.length * rowH + 20;

  // Column separators
  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 1;
  for (let i = 1; i < colCount; i++) {
    const sx = colStarts[i] - spacing / 2;
    ctx.beginPath();
    ctx.moveTo(sx, headerY - 20);
    ctx.lineTo(sx, tableBottom);
    ctx.stroke();
  }

  // Headers
  ctx.font = "bold 38px ND";
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "center";
  for (let c = 0; c < colCount; c++) {
    ctx.fillText(headerLabels[c], colCenters[c], headerY);
    ctx.beginPath();
    ctx.moveTo(colStarts[c] + 8, headerY + 6);
    ctx.lineTo(colStarts[c] + colWidths[c] - 8, headerY + 6);
    ctx.stroke();
  }

  // Rows
  ctx.font = "36px ND";

  for (let i = 0; i < words.length; i++) {
    const ry = firstRowY + i * rowH;
    if (i % 2 === 1) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(margin, ry - 32, tableW, rowH);
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    const w = words[i];
    ctx.fillText(w.nepali, colCenters[0], ry);
    ctx.fillText(w.target, colCenters[1], ry);
    ctx.fillText(w.pronunciation || "", colCenters[2], ry);
    ctx.fillText(w.example, colCenters[3], ry);
  }

  return canvas.toBuffer("image/png");
}
