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
  example: string;
}

export async function generateLanguageTableImage(words: LanguageRow[]): Promise<Buffer> {
  await ensureFonts();
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const margin = 50;
  const tableW = WIDTH - margin * 2;

  ctx.font = "bold 36px ND";

  // Measure column widths based on content
  const headerLabels = ["नेपाली", "English", "Example"];
  const colFields: (keyof LanguageRow)[] = ["nepali", "target", "example"];

  const maxWidths: number[] = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const hW = ctx.measureText(headerLabels[c]).width;
    maxWidths[c] = hW;
    for (const w of words) {
      const tW = ctx.measureText(w[colFields[c]]).width;
      if (tW > maxWidths[c]) maxWidths[c] = tW;
    }
  }

  // Distribute remaining space proportionally
  const totalContent = maxWidths.reduce((a, b) => a + b, 0);
  const spacing = 20;
  const totalSpacing = spacing * 2;
  const available = tableW - totalSpacing;
  const colWidths = maxWidths.map((w) => Math.max(w + 30, (w / totalContent) * available));
  // Normalize to fill tableW
  const sum = colWidths.reduce((a, b) => a + b, 0);
  for (let c = 0; c < 3; c++) {
    colWidths[c] = (colWidths[c] / sum) * available;
  }

  const colStarts = [margin, margin + colWidths[0] + spacing, margin + colWidths[0] + spacing + colWidths[1] + spacing];
  const colCenters = colStarts.map((s, i) => s + colWidths[i] / 2);

  // Column separators
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const sx = colStarts[i] - spacing / 2;
    ctx.beginPath();
    ctx.moveTo(sx, 180);
    ctx.lineTo(sx, 200 + words.length * 95);
    ctx.stroke();
  }

  // Headers
  ctx.font = "bold 36px ND";
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "center";
  for (let c = 0; c < 3; c++) {
    ctx.fillText(headerLabels[c], colCenters[c], 220);
    // underline
    ctx.beginPath();
    ctx.moveTo(colStarts[c] + 10, 228);
    ctx.lineTo(colStarts[c] + colWidths[c] - 10, 228);
    ctx.stroke();
  }

  // Rows
  const rowH = 95;
  const firstRow = 340;
  ctx.font = "32px ND";

  for (let i = 0; i < words.length; i++) {
    const ry = firstRow + i * rowH;
    // Alternating bg
    if (i % 2 === 1) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(margin, ry - 30, tableW, rowH);
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(words[i].nepali, colCenters[0], ry);
    ctx.fillText(words[i].target, colCenters[1], ry);
    ctx.fillText(words[i].example, colCenters[2], ry);
  }

  return canvas.toBuffer("image/png");
}
