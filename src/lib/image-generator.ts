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
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
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

export async function generateLanguageSlides(
  words: LanguageSlide[]
): Promise<Buffer[]> {
  await ensureFonts();
  return Promise.all(words.map(renderLanguageSlide));
}

function renderLanguageSlide(word: LanguageSlide): Buffer {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const colW = 300;
  const colGap = 30;
  const startX = 60;
  const col1X = startX;
  const col2X = startX + colW + colGap;
  const col3X = startX + (colW + colGap) * 2;

  // Column separators
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 2;
  for (let i = 1; i < 3; i++) {
    const sepX = startX + (colW + colGap / 2) * i - 1;
    ctx.beginPath();
    ctx.moveTo(sepX, 300);
    ctx.lineTo(sepX, HEIGHT - 300);
    ctx.stroke();
  }

  // Column headers
  ctx.font = `bold 40px ${FONT_FAMILY}`;
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "center";

  const headerY = 380;
  ctx.fillText("नेपाली", col1X + colW / 2, headerY);
  ctx.fillText("Target", col2X + colW / 2, headerY);
  ctx.fillText("उच्चारण", col3X + colW / 2, headerY);

  // Underline headers
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 1;
  for (const cx of [col1X, col2X, col3X]) {
    ctx.beginPath();
    ctx.moveTo(cx + 40, headerY + 8);
    ctx.lineTo(cx + colW - 40, headerY + 8);
    ctx.stroke();
  }

  // Column values
  ctx.font = `48px ${FONT_FAMILY}`;
  ctx.fillStyle = "#FFFFFF";

  const valY = 500;
  ctx.textAlign = "center";

  // Wrap text within column width
  const maxColW = colW - 20;
  wrapAndDraw(ctx, word.nepali, col1X + colW / 2, valY, maxColW, 70);
  wrapAndDraw(ctx, word.target, col2X + colW / 2, valY, maxColW, 70);
  wrapAndDraw(ctx, word.pronunciation || "", col3X + colW / 2, valY, maxColW, 70);

  // Example sentence at bottom
  ctx.font = `italic 36px ${FONT_FAMILY}`;
  ctx.fillStyle = "#AAAAAA";
  ctx.textAlign = "center";
  wrapAndDraw(ctx, `"${word.example}"`, WIDTH / 2, HEIGHT - 250, WIDTH * 0.8, 55);

  return canvas.toBuffer("image/png");
}

function wrapAndDraw(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): void {
  const lines = wrapText(ctx, text, maxWidth);
  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
}
