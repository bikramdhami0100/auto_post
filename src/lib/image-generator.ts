import { createCanvas, CanvasRenderingContext2D } from "canvas";
import { initCanvasFonts } from "./fonts";

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT_H = "K"; // Kalam handwritten
const FONT_ND = "ND";

let fontsInitialized = false;

async function ensureFonts(): Promise<void> {
  if (fontsInitialized) return;
  await initCanvasFonts();
  fontsInitialized = true;
}

// ─── Doodles ───────────────────────────────────────────────────

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? "moveTo" : "lineTo";
    ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
  // second pass for small inner star
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const rr = r * 0.5;
    const method = i === 0 ? "moveTo" : "lineTo";
    ctx[method](cx + rr * Math.cos(angle), cy + rr * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSmiley(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.15, r * 0.4, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 12 * Math.cos(angle - 0.4), y2 - 12 * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - 12 * Math.cos(angle + 0.4), y2 - 12 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

function drawLightBulb(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  // bulb circle
  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.2, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  // base
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.15, cy + size * 0.2);
  ctx.lineTo(cx + size * 0.15, cy + size * 0.2);
  ctx.lineTo(cx + size * 0.1, cy + size * 0.4);
  ctx.lineTo(cx - size * 0.1, cy + size * 0.4);
  ctx.closePath();
  ctx.fill();
  // glow lines
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i++) {
    const a = (i - 1) * 0.5 - Math.PI * 0.4;
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.5 * Math.cos(a), cy - size * 0.2 + size * 0.5 * Math.sin(a));
    ctx.lineTo(cx + size * 0.8 * Math.cos(a), cy - size * 0.2 + size * 0.8 * Math.sin(a));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ─── Background ────────────────────────────────────────────────

function drawNotebookBg(ctx: CanvasRenderingContext2D): void {
  // Paper color
  ctx.fillStyle = "#FFFBF5";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Light blue horizontal lines
  ctx.strokeStyle = "#D0E0F0";
  ctx.lineWidth = 0.8;
  const lineSpacing = 38;
  for (let y = lineSpacing; y < HEIGHT; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  // Red vertical margin line
  ctx.strokeStyle = "#FF8A8A";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(85, 0);
  ctx.lineTo(85, HEIGHT);
  ctx.stroke();

  // Subtle shadow on left edge
  const grad = ctx.createLinearGradient(0, 0, 40, 0);
  grad.addColorStop(0, "rgba(0,0,0,0.04)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 40, HEIGHT);
}

function drawMarkerHighlight(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font: string,
  padding = 14
): { width: number } {
  ctx.save();
  ctx.font = font;
  const m = ctx.measureText(text);
  const tw = m.width;
  const th = (m.actualBoundingBoxAscent || 40) + (m.actualBoundingBoxDescent || 10);

  // Marker highlight
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(x - padding, y - th - 4, tw + padding * 2, th + 12);
  ctx.globalAlpha = 1;

  // Text
  ctx.fillStyle = "#222222";
  ctx.fillText(text, x, y);
  ctx.restore();

  return { width: tw };
}

function drawDoodles(ctx: CanvasRenderingContext2D): void {
  // Top-right star
  drawStar(ctx, WIDTH - 80, 120, 25, "#FFB5C2");

  // Bottom-left smiley
  drawSmiley(ctx, 120, HEIGHT - 150, 30);

  // Bottom-right arrow
  drawArrow(ctx, WIDTH - 200, HEIGHT - 200, WIDTH - 100, HEIGHT - 120, "#A0C4FF");

  // Light bulb top-left
  drawLightBulb(ctx, 100, 90, 35, "#FFE4A0");

  // Small stars scattered
  drawStar(ctx, 250, 70, 10, "#CAFFBF");
  drawStar(ctx, 80, HEIGHT - 250, 8, "#B5E6FF");
  drawStar(ctx, WIDTH - 150, 80, 12, "#FFC8DD");
}

// ─── Helper ────────────────────────────────────────────────────

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

function randDeg(): number {
  return (Math.random() - 0.5) * 4; // -2 to +2 degrees
}

// ─── Main Image (Motivation / Enlightenment) ───────────────────

export async function generateImage(
  text: string,
  title?: string,
  citation?: string
): Promise<Buffer> {
  await ensureFonts();
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  drawNotebookBg(ctx);
  drawDoodles(ctx);

  const leftMargin = 120;
  const maxWidth = WIDTH - leftMargin - 60;

  // Title
  if (title) {
    ctx.save();
    const rot = (randDeg() * Math.PI) / 180;
    ctx.translate(WIDTH / 2, 160);
    ctx.rotate(rot);

    const highlightColors = ["rgba(255,182,193,0.5)", "rgba(255,255,153,0.5)", "rgba(155,233,168,0.5)", "rgba(164,206,255,0.5)"];
    const color = highlightColors[Math.floor(Math.random() * highlightColors.length)];

    ctx.font = "bold 56px K";
    const m = ctx.measureText(title);
    ctx.fillStyle = color;
    ctx.fillRect(-m.width / 2 - 16, -44, m.width + 32, 68);
    ctx.fillStyle = "#222";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, 0, 0);
    ctx.restore();
  }

  // Body text
  ctx.save();
  const bodyRot = (randDeg() * Math.PI) / 180;
  ctx.translate(leftMargin, 280);
  ctx.rotate(bodyRot);

  ctx.font = "42px K";
  ctx.fillStyle = "#333";
  ctx.textAlign = "left";
  const bodyLines = wrapText(ctx, text, maxWidth);
  let bodyY = 0;
  for (const line of bodyLines) {
    ctx.fillText(line, 0, bodyY);
    bodyY += 70;
  }
  ctx.restore();

  const bodyEndY = 280 + bodyLines.length * 70 + 40;

  // Citation
  if (citation) {
    ctx.save();
    const citRot = (randDeg() * Math.PI) / 180;
    ctx.translate(WIDTH - 80, bodyEndY + 20);
    ctx.rotate(citRot);
    ctx.font = "italic 36px K";
    ctx.fillStyle = "#888";
    ctx.textAlign = "right";
    ctx.fillText(citation, 0, 0);
    ctx.restore();
  }

  return canvas.toBuffer("image/png");
}

// ─── Language Table ────────────────────────────────────────────

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

  drawNotebookBg(ctx);

  const leftMargin = 110;
  const tableW = WIDTH - leftMargin - 40;
  const colCount = 4;
  const spacing = 14;

  const headerLabels = ["नेपाली", "English", "उच्चारण", "Example"];
  const fields: (keyof LanguageRow)[] = ["nepali", "target", "pronunciation", "example"];
  const highlightColors = ["rgba(255,182,193,0.4)", "rgba(255,255,153,0.4)", "rgba(155,233,168,0.4)", "rgba(164,206,255,0.4)"];

  // Title on notebook
  ctx.save();
  ctx.translate(WIDTH / 2, 110);
  ctx.rotate((randDeg() * Math.PI) / 180);
  ctx.font = "bold 44px K";
  const titleText = "नेपाली → अंग्रेजी शब्दहरू";
  drawMarkerHighlight(ctx, titleText, -ctx.measureText(titleText).width / 2, 0, "rgba(255,255,153,0.5)", "bold 44px K");
  ctx.restore();

  // Measure column widths
  ctx.font = "bold 34px K";
  const maxWidths: number[] = [0, 0, 0, 0];
  for (let c = 0; c < colCount; c++) {
    maxWidths[c] = ctx.measureText(headerLabels[c]).width;
    for (const w of words) {
      ctx.font = "32px K";
      const tw = ctx.measureText(w[fields[c]]).width;
      if (tw > maxWidths[c]) maxWidths[c] = tw;
      ctx.font = "bold 34px K";
    }
  }

  // Distribute width
  const totalContent = maxWidths.reduce((a, b) => a + b, 0);
  const totalSpacing = spacing * (colCount - 1);
  const available = tableW - totalSpacing;
  let colWidths = maxWidths.map((w) => Math.max(w + 20, (w / totalContent) * available));
  const sum = colWidths.reduce((a, b) => a + b, 0);
  colWidths = colWidths.map((w) => (w / sum) * available);

  // Column positions
  const colStarts: number[] = [];
  let curX = leftMargin;
  for (let c = 0; c < colCount; c++) {
    colStarts.push(curX);
    curX += colWidths[c] + spacing;
  }
  const colCenters = colStarts.map((s, i) => s + colWidths[i] / 2);

  const headerY = 190;
  const rowH = 100;
  const firstRowY = 290;
  const tableBottom = firstRowY + words.length * rowH + 20;

  // Column separators
  ctx.strokeStyle = "#D0E0F0";
  ctx.lineWidth = 1;
  for (let i = 1; i < colCount; i++) {
    const sx = colStarts[i] - spacing / 2;
    ctx.beginPath();
    ctx.moveTo(sx, headerY - 15);
    ctx.lineTo(sx, tableBottom);
    ctx.stroke();
  }

  // Column headers with marker highlights
  for (let c = 0; c < colCount; c++) {
    ctx.save();
    ctx.translate(colCenters[c], headerY);
    ctx.rotate((randDeg() * Math.PI) / 180);
    ctx.font = "bold 34px K";
    ctx.textAlign = "center";
    drawMarkerHighlight(ctx, headerLabels[c], 0, 0, highlightColors[c], "bold 34px K");
    ctx.restore();
  }

  // Rows
  for (let i = 0; i < words.length; i++) {
    const ry = firstRowY + i * rowH;

    // Alternating pastel row
    if (i % 2 === 1) {
      ctx.fillStyle = "#F0F7FF";
      ctx.fillRect(leftMargin, ry - 30, tableW, rowH);
    }

    ctx.save();
    const rowRot = (randDeg() * Math.PI) / 180;
    ctx.translate(0, ry);
    ctx.rotate(rowRot);

    ctx.font = "32px K";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    const w = words[i];

    // Nepali - use ND as fallback, K should work for Devanagari
    ctx.font = "32px K";
    ctx.fillText(w.nepali, colCenters[0], 0);

    // English
    ctx.font = "32px K";
    ctx.fillText(w.target, colCenters[1], 0);

    // Pronunciation
    ctx.font = "28px K";
    ctx.fillText(w.pronunciation || "", colCenters[2], 0);

    // Example
    ctx.font = "28px K";
    ctx.fillStyle = "#666";
    ctx.fillText(w.example, colCenters[3], 0);

    ctx.restore();
  }

  // Doodles
  drawStar(ctx, WIDTH - 70, 70, 18, "#FFB5C2");
  drawSmiley(ctx, 90, HEIGHT - 120, 25);
  drawLightBulb(ctx, WIDTH - 100, HEIGHT - 100, 28, "#FFE4A0");

  return canvas.toBuffer("image/png");
}
