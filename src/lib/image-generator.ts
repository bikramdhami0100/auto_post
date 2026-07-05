import { createCanvas, CanvasRenderingContext2D } from "canvas";
import { initCanvasFonts, initCJKCanvasFont } from "./fonts";

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
    const lines = wrapText(ctx, title, maxWidth);
    for (const line of lines) {
      ctx.fillText(line, centerX, y);
      y += 90;
    }
    y += 40;
  }

  ctx.font = `48px ${FONT_FAMILY}`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  const bodyLines = wrapText(ctx, text, maxWidth);
  for (const line of bodyLines) {
    ctx.fillText(line, centerX, y);
    y += 75;
  }

  if (citation) {
    y += 30;
    ctx.font = `italic 40px ${FONT_FAMILY}`;
    ctx.fillStyle = "#AAAAAA";
    ctx.textAlign = "center";
    const lines = wrapText(ctx, citation, maxWidth);
    for (const line of lines) {
      ctx.fillText(line, centerX, y);
      y += 55;
    }
  }

  return canvas.toBuffer("image/png");
}

export async function generateCarouselImages(
  items: { text: string; title?: string }[]
): Promise<Buffer[]> {
  await ensureFonts();
  return Promise.all(items.map((item) => generateImage(item.text, item.title)));
}

interface LanguageSlide {
  nepali: string;
  target: string;
  pronunciation: string;
  example: string;
}

const COL_WIDTHS = [270, 400, 330];
const COL_STARTS = [55, 55 + COL_WIDTHS[0] + 20, 55 + COL_WIDTHS[0] + 20 + COL_WIDTHS[1] + 20];
const COL_CENTERS = COL_STARTS.map((s, i) => s + COL_WIDTHS[i] / 2);
const ROW_HEIGHT = 115;
const HEADER_Y = 250;
const FIRST_ROW_Y = 380;
const SEPARATOR_XS = [55 + COL_WIDTHS[0] + 10, 55 + COL_WIDTHS[0] + 20 + COL_WIDTHS[1] + 10];

export async function generateLanguageTableImage(
  words: LanguageSlide[],
  cjkFamily: string
): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Column separators
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1;
  for (const sx of SEPARATOR_XS) {
    ctx.beginPath();
    ctx.moveTo(sx, HEADER_Y - 40);
    ctx.lineTo(sx, FIRST_ROW_Y + words.length * ROW_HEIGHT + 20);
    ctx.stroke();
  }

  // Column headers
  ctx.font = `bold 36px ${FONT_FAMILY}`;
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "center";

  ctx.fillText("नेपाली", COL_CENTERS[0], HEADER_Y);
  ctx.fillText("Target", COL_CENTERS[1], HEADER_Y);
  ctx.fillText("उच्चारण", COL_CENTERS[2], HEADER_Y);

  // Header underline
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 1;
  for (const cx of COL_CENTERS) {
    ctx.beginPath();
    ctx.moveTo(cx - 60, HEADER_Y + 8);
    ctx.lineTo(cx + 60, HEADER_Y + 8);
    ctx.stroke();
  }

  // Draw rows
  for (let i = 0; i < words.length; i++) {
    const rowY = FIRST_ROW_Y + i * ROW_HEIGHT;
    const w = words[i];

    // Alternating row bg
    if (i % 2 === 1) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(30, rowY - 35, WIDTH - 60, ROW_HEIGHT);
    }

    // Nepali col - ND font
    ctx.font = `40px ${FONT_FAMILY}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(w.nepali, COL_CENTERS[0], rowY);

    // Target col - CJK font
    ctx.font = `40px ${cjkFamily}`;
    ctx.fillText(w.target, COL_CENTERS[1], rowY);

    // Pronunciation col - ND font
    ctx.font = `36px ${FONT_FAMILY}`;
    ctx.fillText(w.pronunciation || "", COL_CENTERS[2], rowY);
  }

  // Example at bottom
  ctx.font = `italic 28px ${FONT_FAMILY}`;
  ctx.fillStyle = "#666666";
  ctx.textAlign = "center";
  ctx.fillText(`"${words[0].example}"`, WIDTH / 2, FIRST_ROW_Y + words.length * ROW_HEIGHT + 70);

  return canvas.toBuffer("image/png");
}
