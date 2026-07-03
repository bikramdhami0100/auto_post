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
