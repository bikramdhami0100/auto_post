import { createCanvas, registerFont } from "canvas";
import { join } from "path";

const WIDTH = 1080;
const HEIGHT = 1920;

registerFont(join(process.cwd(), "public/fonts/NotoSansDevanagari-Regular.ttf"), { family: "ND" });
registerFont(join(process.cwd(), "public/fonts/NotoSansDevanagari-Bold.ttf"), { family: "ND", weight: "bold" });

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
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const maxWidth = WIDTH * 0.8;
  const centerX = WIDTH / 2;

  let y = HEIGHT * 0.25;

  if (title) {
    ctx.font = "bold 64px ND";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    const lines = wrapText(ctx, title, maxWidth);
    for (const line of lines) {
      ctx.fillText(line, centerX, y);
      y += 90;
    }
    y += 40;
  }

  ctx.font = "48px ND";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  const bodyLines = wrapText(ctx, text, maxWidth);
  for (const line of bodyLines) {
    ctx.fillText(line, centerX, y);
    y += 75;
  }

  if (citation) {
    y += 30;
    ctx.font = "italic 40px ND";
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
  return Promise.all(items.map((item) => generateImage(item.text, item.title)));
}
