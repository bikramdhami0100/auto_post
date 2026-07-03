import { createCanvas } from "canvas";

const WIDTH = 1080;
const HEIGHT = 1920;

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

  const centerX = WIDTH / 2;
  const maxWidth = WIDTH * 0.8;

  let startY = HEIGHT * 0.25;

  if (title) {
    ctx.font = "bold 64px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    const titleLines = wrapText(ctx, title, maxWidth);
    for (const line of titleLines) {
      ctx.fillText(line, centerX, startY);
      startY += 80;
    }
    startY += 60;
  }

  ctx.font = "48px sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  const bodyLines = wrapText(ctx, text, maxWidth);
  for (const line of bodyLines) {
    ctx.fillText(line, centerX, startY);
    startY += 70;
  }

  if (citation) {
    startY += 40;
    ctx.font = "italic 40px sans-serif";
    ctx.fillStyle = "#AAAAAA";
    ctx.textAlign = "center";
    const citeLines = wrapText(ctx, citation, maxWidth);
    for (const line of citeLines) {
      ctx.fillText(line, centerX, startY);
      startY += 55;
    }
  }

  return canvas.toBuffer("image/png");
}

export async function generateCarouselImages(
  items: { text: string; title?: string }[]
): Promise<Buffer[]> {
  return Promise.all(
    items.map((item) => generateImage(item.text, item.title))
  );
}
